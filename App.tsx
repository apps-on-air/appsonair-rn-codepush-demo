import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, RefreshControl } from 'react-native';
import CodePush from '@code-push-next/react-native-code-push';

const App = () => {
  const [statusCode, setStatusCode] = useState<string | undefined>();
  const [jsonMetadata, setJsonMetadata] = useState<object>();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const SyncStatusNameMap: Record<number, string> = Object.entries(
    CodePush.SyncStatus,
  )
    .filter(([_, value]) => typeof value === 'number')
    .reduce((acc, [key, value]) => {
      acc[value as number] = key;
      return acc;
    }, {} as Record<number, string>);

  const syncWithCodePush = async () => {
    setRefreshing(true);
    try {
      await CodePush.sync(
        {
          updateDialog: true,
          installMode: CodePush.InstallMode.IMMEDIATE,
          mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
        },
        status => {
          const statusName = SyncStatusNameMap[status];
          setStatusCode(statusName);
        },
      );
      await getCodePushMetadata();
    } catch (e) {
      console.warn('CodePush sync failed', e);
    } finally {
      setRefreshing(false);
    }
  };

  const getCodePushMetadata = async () => {
    const metadata = await CodePush.getUpdateMetadata();
    if (metadata) {
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
      setJsonMetadata(undefined);
    }
  };

  useEffect(() => {
    syncWithCodePush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={syncWithCodePush} />
      }
    >
      <Text style={styles.text}>APP</Text>
      {statusCode && <Text style={styles.text}>Status: {statusCode}</Text>}
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
