import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, RefreshControl } from 'react-native';
import CodePush from '@code-push-next/react-native-code-push';

const App = () => {
  // Holds the current CodePush sync status as a readable string
  const [statusCode, setStatusCode] = useState<string | undefined>();

  // Stores metadata about the current CodePush update (if any)
  const [jsonMetadata, setJsonMetadata] = useState<object>();

  // Used to control the pull-to-refresh spinner
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Converts the CodePush.SyncStatus object (which maps strings to numbers)
   * into a reverse map that lets us look up the string name by number.
   * Example:
   * CodePush.SyncStatus.DOWNLOADING_PACKAGE = 3
   * becomes { 3: "DOWNLOADING_PACKAGE" }
   */
  const SyncStatusNameMap: Record<number, string> = Object.entries(
    CodePush.SyncStatus,
  )
    .filter(([_, value]) => typeof value === 'number')
    .reduce((acc, [key, value]) => {
      acc[value as number] = key;
      return acc;
    }, {} as Record<number, string>);

  /**
   * Handles syncing the app with CodePush to check for updates.
   * It shows the update dialog, installs updates immediately,
   * and updates the current sync status and metadata in the UI.
   */
  const syncWithCodePush = async () => {
    setRefreshing(true); // start the refresh spinner
    try {
      // Start CodePush sync
      await CodePush.sync(
        {
          updateDialog: true, // show the default update dialog
          installMode: CodePush.InstallMode.IMMEDIATE, // install immediately after download
          mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE, // same for mandatory updates
        },
        status => {
          // Convert the numeric status to a readable name using the map
          const statusName = SyncStatusNameMap[status];
          setStatusCode(statusName);
        },
      );

      // After syncing, fetch metadata about the current update
      await getCodePushMetadata();
    } catch (e) {
      console.warn('CodePush sync failed', e);
    } finally {
      // Stop the refresh spinner
      setRefreshing(false);
    }
  };

  /**
   * Fetches metadata about the currently applied CodePush update.
   * This includes version, label, description, etc.
   */
  const getCodePushMetadata = async () => {
    const metadata = await CodePush.getUpdateMetadata();

    if (metadata) {
      // Pick only relevant fields from the metadata
      const json = {
        appVersion: metadata.appVersion,
        deploymentKey: metadata.deploymentKey,
        description: metadata.description,
        failedInstall: metadata.failedInstall,
        isFirstRun: metadata.isFirstRun,
        isMandatory: metadata.isMandatory,
        isPending: metadata.isPending,
        label: metadata.label,
        packageHash: metadata.packageHash,
        packageSize: metadata.packageSize,
      };
      setJsonMetadata(json);
    } else {
      // No CodePush update has been installed
      setJsonMetadata(undefined);
    }
  };

  /**
   * Run CodePush sync automatically when the app starts.
   */
  useEffect(() => {
    syncWithCodePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        // Adds pull-to-refresh functionality to manually trigger sync
        <RefreshControl refreshing={refreshing} onRefresh={syncWithCodePush} />
      }
    >
      <Text style={styles.text}>APP</Text>

      {/* Show current CodePush sync status */}
      {statusCode && <Text style={styles.text}>Status: {statusCode}</Text>}

      {/* Show update metadata or a fallback message */}
      {!jsonMetadata ? (
        <Text style={styles.text}>No CodePush Installed</Text>
      ) : (
        <Text>{JSON.stringify(jsonMetadata, null, 2)}</Text>
      )}
    </ScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    rowGap: 20,
    paddingTop: 50,
    minHeight: '100%',
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
});
