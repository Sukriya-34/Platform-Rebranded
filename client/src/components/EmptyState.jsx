import { FileX } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileX size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-[#101219] mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>
      {action && onAction && (
        <Button onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}
