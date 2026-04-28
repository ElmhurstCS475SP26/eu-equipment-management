/*
 * return/page.jsx — Equipment Return Page
 * Allows students to initiate a return by scanning a QR code or manually entering
 * an equipment ID. After identifying the item, they select its condition and can
 * upload damage photos if needed. Currently uses mock data; not yet wired to the DB.
 */
"use client";

import { useState } from "react";
import { QrCode, Camera, CheckCircle, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EquipmentReturn() {
  const [equipmentId, setEquipmentId] = useState("");
  const [condition, setCondition] = useState("excellent");
  const [comments, setComments] = useState("");
  const [hasImage, setHasImage] = useState(false);

  const handleScanQR = () => {
    // Mock QR code scan
    setEquipmentId("CAM-001");
    toast.success("Equipment scanned successfully");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!equipmentId) {
      toast.error("Please scan or enter equipment ID");
      return;
    }

    toast.success("Equipment returned successfully", {
      description: "Thank you for returning the equipment in good condition.",
    });

    // Reset form
    setEquipmentId("");
    setCondition("excellent");
    setComments("");
    setHasImage(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Return Equipment</h1>
        <p className="text-gray-600">Scan equipment QR code and confirm return</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* QR Code Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan Equipment QR Code
            </CardTitle>
            <CardDescription>
              Scan the QR code on the equipment to begin the return process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-gray-50">
              <QrCode className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">Position QR code within the frame</p>
              <Button type="button" onClick={handleScanQR} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4" />
                Scan QR Code
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or enter manually</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentId">Equipment ID</Label>
              <Input
                id="equipmentId"
                type="text"
                placeholder="e.g., CAM-001"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
              />
            </div>

            {equipmentId && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Equipment Identified</p>
                  <p className="text-sm text-green-700">Canon EOS R5 - Ready for return</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equipment Condition */}
        {equipmentId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Equipment Condition</CardTitle>
                <CardDescription>
                  Please report the condition of the equipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={condition} onValueChange={setCondition}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent" className="font-normal cursor-pointer">
                      Excellent - No issues, works perfectly
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good" className="font-normal cursor-pointer">
                      Good - Minor wear, fully functional
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="fair" />
                    <Label htmlFor="fair" className="font-normal cursor-pointer">
                      Fair - Some issues, needs attention
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="damaged" id="damaged" />
                    <Label htmlFor="damaged" className="font-normal cursor-pointer">
                      Damaged - Requires repair or replacement
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="comments">Additional Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Describe any issues or concerns..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Damage Report */}
            {(condition === "fair" || condition === "damaged") && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-900">Damage Report</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Please upload photos of any damage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-yellow-300 rounded-lg p-6 bg-white">
                      <Upload className="h-12 w-12 text-yellow-600 mb-3" />
                      <p className="text-sm text-gray-600 mb-3">Upload photos of damage</p>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={() => setHasImage(true)}
                        className="max-w-xs"
                      />
                    </div>
                    {hasImage && (
                      <div className="flex items-center gap-2 p-3 bg-white border border-yellow-300 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-900">Image uploaded successfully</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Confirm Return
              </Button>
            </div>
          </>
        )}
      </form>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Return Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Ensure all equipment accessories are included (cables, batteries, cases, etc.)</li>
            <li>Clean the equipment and return it in the same condition as received</li>
            <li>Scan the QR code on the equipment or enter the Equipment ID manually</li>
            <li>Report the equipment condition honestly</li>
            <li>If there's any damage, upload photos and provide details</li>
            <li>A staff member will inspect the equipment and confirm the return</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
