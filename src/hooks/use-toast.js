export const useToast = () => {
  const toast = ({ title, description }) => {
    // Simple alert for now, effectively "mocking" the toast behavior
    // In a real app we'd need a Context provider
    alert(`${title}\n${description}`);
    console.log(`Toast: ${title} - ${description}`);
  };

  return { toast };
};
