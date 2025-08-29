"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UploadCardProps } from "./types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadCard({ 
  baseImage, 
  onImageUpload, 
  uploadError, 
  isGenerating 
}: UploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
            <div className="relative group">
              <img
                src={baseImage}
                alt="Base avatar"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                onClick={clearImage}
                disabled={isGenerating}
                className={cn(
                  "absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ✓ Ready! Select traits to generate.
            </p>
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
      </CardContent>
    </Card>
  );
}
