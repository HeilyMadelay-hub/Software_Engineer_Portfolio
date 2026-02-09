import { useEffect, useMemo, useState } from 'react';

type UseSearchOptions<T> = {
    searchFields: (keyof T)[];
    statusField?: keyof T;
    initialFilter?: string;
    debounceMs?: number; // milliseconds to debounce the query
    caseSensitive?: boolean;
    // Optional custom filter function (overrides default behavior)
    customFilter?: (item: T, query: string, filter: string) => boolean;
};

export default function useSearch<T extends Record<string, any>>(items: T[], options: UseSearchOptions<T>) {
    const {
        searchFields,
        statusField,
        initialFilter = 'all',
        debounceMs = 300,
        caseSensitive = false,
        customFilter,
    } = options;

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<string>(initialFilter);
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce query updates to avoid filtering on every keystroke
    useEffect(() => {
        if (!debounceMs) {
            setDebouncedQuery(query);
            return;
        }

        setIsSearching(true);
        const t = setTimeout(() => {
            setDebouncedQuery(query);
            setIsSearching(false);
        }, debounceMs);

        return () => {
            clearTimeout(t);
        };
    }, [query, debounceMs]);

    const filtered = useMemo(() => {
        const q = debouncedQuery.trim();
        const qNorm = caseSensitive ? q : q.toLowerCase();

        // if a custom filter is provided, use it
        if (typeof customFilter === 'function') {
            return items.filter((item) => customFilter(item, q, filter));
        }

        return items.filter((item) => {
            const matchesSearch =
                q === '' ||
                searchFields.some((field) => {
                    const value = item[field];
                    if (value === undefined || value === null) return false;
                    const str = String(value);
                    return caseSensitive ? str.includes(qNorm) : str.toLowerCase().includes(qNorm);
                });

            const matchesFilter =
                !statusField || filter === 'all' || String(item[statusField]) === filter;

            return matchesSearch && matchesFilter;
        });
        // Only recompute when items, debouncedQuery, filter or these config values change
    }, [items, debouncedQuery, filter, searchFields, statusField, customFilter, caseSensitive]);

    const reset = () => {
        setQuery('');
        setFilter(initialFilter);
        setDebouncedQuery('');
    };

    return { query, setQuery, filter, setFilter, filtered, reset, isSearching } as const;
}
