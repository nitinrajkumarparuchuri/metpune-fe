import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Award, BarChart, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Hackathon AI Evaluation System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your hackathon evaluations with AI-powered analysis, summaries, and insights.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/index">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Enter Dashboard
                </Button>
              </Link>
              <Link to="/hackathons">
                <Button size="lg" variant="outline">
                  <FileText className="mr-2 h-5 w-5" />
                  Manage Hackathons
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="p-3 bg-purple-100 rounded-full w-fit mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Automated Document Analysis</h2>
              <p className="text-gray-600">
                Our AI system automatically processes team submissions and extracts key information.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="p-3 bg-blue-100 rounded-full w-fit mb-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI-Powered Evaluation</h2>
              <p className="text-gray-600">
                Get objective evaluations based on customizable judging criteria for each team.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="p-3 bg-green-100 rounded-full w-fit mb-4">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Comprehensive Insights</h2>
              <p className="text-gray-600">
                Generate hackathon-wide insights and identify trends across team projects.
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center py-8">
            <Link to="/index">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Hackathon AI Evaluation System &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;