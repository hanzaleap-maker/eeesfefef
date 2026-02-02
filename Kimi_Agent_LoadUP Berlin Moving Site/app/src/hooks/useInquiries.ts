import { useLocalStorage } from './useLocalStorage';
import type { CustomerInquiry, FormData } from '@/types';

const STORAGE_KEY = 'loadup_inquiries';

export function useInquiries() {
  const [inquiries, setInquiries] = useLocalStorage<CustomerInquiry[]>(STORAGE_KEY, []);

  const addInquiry = (formData: FormData) => {
    const newInquiry: CustomerInquiry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      formData,
      status: 'new',
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry.id;
  };

  const updateInquiryStatus = (id: string, status: CustomerInquiry['status']) => {
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, status } : inquiry
      )
    );
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inquiry) => inquiry.id !== id));
  };

  const getInquiryById = (id: string) => {
    return inquiries.find((inquiry) => inquiry.id === id);
  };

  return {
    inquiries,
    addInquiry,
    updateInquiryStatus,
    deleteInquiry,
    getInquiryById,
  };
}
