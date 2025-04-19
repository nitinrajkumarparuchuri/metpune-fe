import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, ArrowRight } from 'lucide-react';

interface FilterWithWeightage {
  name: string;
  weightage: number;
}

const JudgementCriteria = () => {
  const [filters, setFilters] = useState<FilterWithWeightage[]>([]);
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
    if (!filters.some(f => f.name === filter) && filter.trim() !== '') {
      setFilters([...filters, { name: filter, weightage: 12 }]);
      setInputValue('');
    }
  };

  const removeFilter = (filterToRemove: string) => {
    setFilters(filters.filter(filter => filter.name !== filterToRemove));
  };

  const updateWeightage = (filterName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFilters(filters.map(filter => 
      filter.name === filterName 
        ? { ...filter, weightage: numValue } 
        : filter
    ));
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

      {/* Selected filters with weightage */}
      {filters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm text-gray-600 mb-2">Selected Filters:</h2>
          <div className="flex flex-col gap-2">
            {filters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg"
              >
                <span className="flex-1">{filter.name}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={filter.weightage}
                    onChange={(e) => updateWeightage(filter.name, e.target.value)}
                    className="w-20 h-8 text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm">%</span>
                  <button
                    onClick={() => removeFilter(filter.name)}
                    className="hover:text-purple-900 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
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
              disabled={filters.some(f => f.name === filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Proceed button */}
      {filters.length > 0 && (
        <div className="mt-8">
          <Button className="w-full sm:w-auto">
            Proceed to Judge
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default JudgementCriteria;
