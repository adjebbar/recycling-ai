import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';

export interface Reward {
  id: number;
  name: string;
  cost: number;
  icon: string;
}

// Fetch rewards
const fetchRewards = async () => {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('cost', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

// Add a reward
const addReward = async (reward: Omit<Reward, 'id'>) => {
  const { data, error } = await supabase.from('rewards').insert([reward]).select();
  if (error) throw new Error(error.message);
  return data;
};

// Update a reward
const updateReward = async (reward: Reward) => {
  const { data, error } = await supabase
    .from('rewards')
    .update({ name: reward.name, cost: reward.cost, icon: reward.icon })
    .eq('id', reward.id)
    .select();
  if (error) throw new Error(error.message);
  return data;
};

// Delete a reward
const deleteReward = async (id: number) => {
  const { error } = await supabase.from('rewards').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const useRewards = () => {
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading, isError } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: fetchRewards,
  });

  const addMutation = useMutation({
    mutationFn: addReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccess('Reward added successfully!');
    },
    onError: (error) => {
      showError(`Failed to add reward: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccess('Reward updated successfully!');
    },
    onError: (error) => {
      showError(`Failed to update reward: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccess('Reward deleted successfully!');
    },
    onError: (error) => {
      showError(`Failed to delete reward: ${error.message}`);
    },
  });

  return {
    rewards,
    isLoading,
    isError,
    addReward: addMutation.mutateAsync,
    updateReward: updateMutation.mutateAsync,
    deleteReward: deleteMutation.mutateAsync,
  };
};