"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ExternalLink, Loader2, Upload, Coins } from "lucide-react";
import type { MintingProgress } from "./types";
import { Button } from "@/components/ui/button";

interface MintingProgressProps {
  progress: MintingProgress;
  onClose?: () => void;
}

export function MintingProgress({ progress, onClose }: MintingProgressProps) {
  const getStepIcon = () => {
    switch (progress.step) {
      case 'uploading-image':
      case 'uploading-metadata':
      case 'getting-item-id':
        return <Upload className="w-5 h-5 text-blue-500" />;
      case 'creating-transaction':
      case 'signing':
      case 'broadcasting':
      case 'in-block':
        return <Coins className="w-5 h-5 text-blue-500" />;
      case 'finalized':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getProgressColor = () => {
    switch (progress.step) {
      case 'finalized':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getSimpleMessage = () => {
    switch (progress.step) {
      case 'uploading-image':
      case 'uploading-metadata':
      case 'getting-item-id':
        return 'Uploading to IPFS...';
      case 'creating-transaction':
      case 'signing':
      case 'broadcasting':
      case 'in-block':
        return 'Minting NFT...';
      case 'finalized':
        return 'NFT Minted Successfully!';
      case 'error':
        return 'Minting Failed';
      default:
        return 'Processing...';
    }
  };

  const steps = [
    { title: 'Uploading to IPFS', completed: progress.progress >= 60 },
    { title: 'Minting NFT', completed: progress.progress >= 100 },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          {getStepIcon()}
          <div className="flex-1">
            <div className="text-lg font-semibold">{getSimpleMessage()}</div>
            <p className="text-sm text-muted-foreground font-normal">{progress.message}</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Simple Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-green-600 font-medium' : 'text-muted-foreground'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* NFT Details */}
        {progress.itemId && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">NFT Item ID: #{progress.itemId}</p>
          </div>
        )}

        {/* Error Display */}
        {progress.step === 'error' && progress.error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">{progress.error}</p>
          </div>
        )}

        {/* Wallet Signing Message */}
        {progress.step === 'signing' && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium">
              Please approve the transaction in your wallet
            </p>
          </div>
        )}

        {/* In Progress Notice */}
        {progress.step !== 'idle' && progress.step !== 'finalized' && progress.step !== 'error' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              Minting in progress... Please do not close this dialog.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {(progress.step === 'finalized' || progress.step === 'error') && onClose && (
          <div className="flex space-x-2">
            <Button onClick={onClose} className="flex-1">
              {progress.step === 'finalized' ? 'Close' : 'Try Again'}
            </Button>
            {progress.step === 'finalized' && progress.txHash && (
              <Button variant="outline" asChild size="sm">
                <a
                  href={`https://assethub-paseo.subscan.io/extrinsic/${progress.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View</span>
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
