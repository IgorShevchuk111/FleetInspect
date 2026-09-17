import {
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

// EXACT SAME as your original
export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusIcon = (status: string) => {
    return status === 'passed' ? CheckCircleIcon : XCircleIcon;
};

export const getStatusColor = (status: string) => {
    return status === 'passed'
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
};