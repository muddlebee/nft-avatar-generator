"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LighthouseStorage } from '@/lib/services/lighthouse-storage';
import { buildPrompt } from '@/lib/avatar-generator/prompt-builder';
import type { TraitSelection } from '@/components/avatar-generator/types';

const TEST_CONFIG = {
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  traits: {
    headgear: 'Beanie',
    accessory: 'Sunglasses', 
    clothing: 'Hoodie',
    background: 'Neon City',
    expression: 'Smirk',
    hair: 'Long',
    skin: 'Light',
    special: 'Glowing Eyes',
    weapon: null
  } as TraitSelection,
  seed: 12345,
  itemId: 999
};

export default function TestIPFSBrowser() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const addResult = (test: string, success: boolean, data?: any, error?: string) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setCurrentTest(testName);
    setIsLoading(true);
    
    try {
      const result = await testFn();
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  const testConnection = async () => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) throw new Error('API key not configured');
    
    const lighthouse = new LighthouseStorage(apiKey);
    return await lighthouse.testConnection();
  };

  const testImageUpload = async () => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) throw new Error('API key not configured');
    
    const lighthouse = new LighthouseStorage(apiKey);
    const startTime = Date.now();
    
    const result = await lighthouse.uploadImage(TEST_CONFIG.imageUrl, (progress) => {
      console.log(`Image upload progress: ${progress}%`);
    });
    
    return {
      ...result,
      uploadTime: Date.now() - startTime
    };
  };

  const testMetadataUpload = async () => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) throw new Error('API key not configured');
    
    const lighthouse = new LighthouseStorage(apiKey);
    
    // First upload image
    const imageResult = await lighthouse.uploadImage(TEST_CONFIG.imageUrl);
    
    // Then upload metadata
    const prompt = buildPrompt(TEST_CONFIG.traits);
    const startTime = Date.now();
    
    const metadataResult = await lighthouse.uploadMetadata(
      imageResult.cid,
      TEST_CONFIG.traits,
      TEST_CONFIG.seed,
      prompt,
      TEST_CONFIG.itemId,
      (progress) => {
        console.log(`Metadata upload progress: ${progress}%`);
      }
    );
    
    return {
      imageCID: imageResult.cid,
      metadataCID: metadataResult.cid,
      imageGatewayUrl: imageResult.gatewayUrl,
      metadataGatewayUrl: metadataResult.gatewayUrl,
      metadata: metadataResult.metadata,
      uploadTime: Date.now() - startTime
    };
  };

  const testCompleteFlow = async () => {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) throw new Error('API key not configured');
    
    const lighthouse = new LighthouseStorage(apiKey);
    const prompt = buildPrompt(TEST_CONFIG.traits);
    const itemId = Date.now();
    const startTime = Date.now();
    
    const result = await lighthouse.uploadComplete(
      TEST_CONFIG.imageUrl,
      TEST_CONFIG.traits,
      TEST_CONFIG.seed,
      prompt,
      itemId,
      (step, progress) => {
        console.log(`${step} (${progress}%)`);
      }
    );
    
    return {
      ...result,
      totalTime: Date.now() - startTime
    };
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 IPFS Browser Test Suite</CardTitle>
          <p className="text-muted-foreground">
            Testing Lighthouse IPFS integration in browser environment
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => runTest('Connection Test', testConnection)}
              disabled={isLoading}
              variant="outline"
            >
              🔗 Test Connection
            </Button>
            
            <Button
              onClick={() => runTest('Image Upload', testImageUpload)}
              disabled={isLoading}
              variant="outline"
            >
              🖼️ Test Image Upload
            </Button>
            
            <Button
              onClick={() => runTest('Metadata Upload', testMetadataUpload)}
              disabled={isLoading}
              variant="outline"
            >
              📋 Test Metadata
            </Button>
            
            <Button
              onClick={() => runTest('Complete Flow', testCompleteFlow)}
              disabled={isLoading}
              variant="outline"
            >
              🔄 Test Complete Flow
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Running: {currentTest}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {results.length > 0 && (
              <Button onClick={clearResults} variant="ghost" size="sm">
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✅' : '❌'}
                </span>
                <h4 className="font-semibold">{result.test}</h4>
                <span className="text-sm text-muted-foreground">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✅ Test passed successfully!</p>
                  {result.data && (
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">❌ Test failed</p>
                  <p className="text-sm text-red-500 font-mono bg-red-50 p-2 rounded">
                    {result.error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tests run yet. Click a test button above to start.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
