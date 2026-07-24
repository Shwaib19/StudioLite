import { useEffect } from 'react';
import { useModelStore } from '../stores/modelStore';

export function useModels() {
  const store = useModelStore();

  useEffect(() => {
    if (store.models.length === 0 && !store.isLoading) {
      store.fetchModels();
    }
  }, []);

  return {
    models: store.models,
    selectedModelId: store.selectedModelId,
    isLoading: store.isLoading,
    error: store.error,
    selectModel: store.selectModel,
    refreshModels: store.refreshModels,
  };
}