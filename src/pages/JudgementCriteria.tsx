
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const JudgementCriteria = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const suggestedFilters = [
    'AI through out the SDLC',
    'Speed and efficiency',
    'working product',
    'craft and quality',
    'Innovation',
    'Knowledge sharing'
  ];

  const addFilter = (filter: string) => {
    if (!filters.includes(filter) && filter.trim() !== '') {
      setFilters([...filters, filter]);
      setInputValue('');
    }
  };

  const removeFilter = (filterToRemove: string) => {
    setFilters(filters.filter(filter => filter !== filterToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addFilter(inputValue);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Judgement Criteria</h1>
      
      {/* Filter input with add button */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Add custom filter criteria..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pr-10"
          />
        </div>
        <Button 
          onClick={() => addFilter(inputValue)}
          variant="outline"
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected filters */}
      {filters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm text-gray-600 mb-2">Selected Filters:</h2>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
              >
                <span>{filter}</span>
                <button
                  onClick={() => removeFilter(filter)}
                  className="hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested filters */}
      <div>
        <h2 className="text-sm text-gray-600 mb-2">Suggested Filters:</h2>
        <div className="flex flex-wrap gap-2">
          {suggestedFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => addFilter(filter)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors"
              disabled={filters.includes(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JudgementCriteria;
