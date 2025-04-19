
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Let AI Decode Your Hackathon
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Auto-transcribe, summarize, and analyze your hackathon presentations — zero manual effort.
            </p>
            <Button 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
              onClick={() => navigate('/dashboard')}
            >
              Get Started
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
