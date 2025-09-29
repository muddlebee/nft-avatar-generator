"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { UploadCardProps } from "./types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadCard({ 
  baseImage, 
  onImageUpload, 
  uploadError, 
  isGenerating,
  referralCode,
  referralCodeValidated,
  referralCodeTier,
  maxAttempts,
  attemptsUsed,
  wasAutoApplied,
  onReferralCodeValidate
}: UploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload a JPG, PNG, or WebP image";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageUpload(file, dataUrl);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsProcessing(false);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const clearImage = useCallback(() => {
    onImageUpload(null as any, "");
  }, [onImageUpload]);

  const handleReferralCodeSubmit = useCallback(() => {
    if (referralCodeInput.trim()) {
      const isValid = onReferralCodeValidate(referralCodeInput.trim());
      if (isValid) {
        setReferralCodeInput("");
      }
    }
  }, [referralCodeInput, onReferralCodeValidate]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="w-4 h-4" />
          Upload Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        {baseImage ? (
          <div className="space-y-3">
            <div className="relative group h-48">
              <Image
                src={baseImage}
                alt="Base avatar"
                fill
                className="object-contain rounded-lg border bg-muted/30"
              />
              <button
                onClick={clearImage}
                disabled={isGenerating}
                className={cn(
                  "absolute top-2 right-2 p-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full shadow-sm transition-all duration-200 hover:scale-110",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                ✓ Ready! Select traits below to generate.
              </p>
              <button
                onClick={clearImage}
                disabled={isGenerating}
                className={cn(
                  "text-xs text-destructive hover:text-destructive/80 transition-colors",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                Remove image
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
              id="avatar-upload"
            />
            <label 
              htmlFor="avatar-upload" 
              className="cursor-pointer block"
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {isProcessing ? "Processing..." : "Drop your image here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP • Max 5MB
                </p>
              </div>
            </label>
          </div>
        )}
        
        {uploadError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}

        {/* Referral Code Section */}
        <div className="mt-4 pt-4 border-t border-border">
          {!referralCodeValidated ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Enter Referral Code
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReferralCodeSubmit()}
                  disabled={isGenerating}
                  placeholder="Enter your referral code"
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                />
                <button
                  onClick={handleReferralCodeSubmit}
                  disabled={!referralCodeInput.trim() || isGenerating}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Validate
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${attemptsUsed >= maxAttempts ? 'text-red-600' : 'text-green-600'}`}>
                    {attemptsUsed >= maxAttempts ? '⚠️' : '✓'} {referralCodeTier} Code {attemptsUsed >= maxAttempts ? 'Exhausted' : 'Validated'}
                  </span>
                  {wasAutoApplied && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full border">
                      Auto-applied
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {attemptsUsed}/{maxAttempts} attempts used
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${attemptsUsed >= maxAttempts ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(attemptsUsed / maxAttempts) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${attemptsUsed >= maxAttempts ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {attemptsUsed >= maxAttempts ? 'No attempts remaining' : `${maxAttempts - attemptsUsed} attempts remaining`}
                </p>
                {referralCode && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Code: {referralCode}
                  </p>
                )}
              </div>
  {/*             {wasAutoApplied && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    🎉 <span className="font-medium">Welcome!</span> Your referral code was automatically applied from the URL.
                  </p>
                </div>
              )} */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
