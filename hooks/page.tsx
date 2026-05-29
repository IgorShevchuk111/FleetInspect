'use client';

import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import {
  getInspectionForm,
  getInspection,
} from '@/features/inspections/services';

import { createUpdateInspection } from '@/features/inspections/actions';
import { createClient } from '@/lib/supabase/client';

export default function InspectionDetailsPage() {
  const router = useRouter();
  const params = useParams<{ vehicleId: string }>();
  const searchParams = useSearchParams();

  const vehicleId = params.vehicleId;
  const tripType = searchParams.get('trip');
  const inspectionId = searchParams.get('inspectionId');
  const mode = searchParams.get('mode') || 'edit';

  const [user, setUser] = useState<any>(null);

  const [vehicle, setVehicle] = useState<any>(null);
  const [formItems, setFormItems] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [timeValues, setTimeValues] = useState<Record<string, string>>({});
  const [numberValues, setNumberValues] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, any[]>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const [existingInspection, setExistingInspection] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [isOwner, setIsOwner] = useState(true);

  const sigPadRef = useRef<SignatureCanvas>(null);

  // USER
  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data?.user) setUser(data.user);
    };

    loadUser();
  }, []);

  // DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!vehicleId && !inspectionId) return;

      let inspection = null;

      if (inspectionId) {
        inspection = await getInspection(inspectionId);
        setExistingInspection(inspection);
      }

      const { inspectionForm, vehicle } = await getInspectionForm(
        inspection?.vehicle_id || vehicleId,
        inspection?.trip || tripType || '',
      );

      setVehicle(vehicle);
      setFormItems(inspectionForm);

      if (inspection) {
        const initialChecked: any = {};
        const initialNotes: any = {};
        const initialTime: any = {};
        const initialNumbers: any = {};
        const initialImages: any = {};

        inspectionForm.forEach((f: any) => {
          if (f.type === 'checkbox') {
            initialChecked[f.name] = inspection[f.name];
            initialImages[f.name] = (inspection[`${f.name}_photos`] || []).map(
              (url: string) => ({
                id: crypto.randomUUID(),
                url,
                file: null,
              }),
            );
          }

          if (f.type === 'time') {
            initialTime[f.name] = inspection[`${f.name}_value`] || '';
          }

          if (f.type === 'number') {
            initialNumbers[f.name] = inspection[`${f.name}_value`] || '';
          }
        });

        setCheckedItems(initialChecked);
        setNotes(initialNotes);
        setTimeValues(initialTime);
        setNumberValues(initialNumbers);
        setImages(initialImages);
        setSignature(inspection.signature);
      }
    };

    fetchData();
  }, [vehicleId, inspectionId, tripType]);

  // EDIT RULE
  useEffect(() => {
    setCanEdit(isOwner && mode === 'edit');
  }, [isOwner, mode]);

  const handleSubmit = async () => {
    console.log(2222);

    setSubmitAttempted(true);

    if (!user) return toast.error('Not authenticated');
    if (!signature) return toast.error('Signature required');

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('vehicleId', vehicleId);
      formData.append('user_id', user.id);
      formData.append('trip', tripType || '');
      formData.append('signature', signature);

      Object.entries(checkedItems).forEach(([k, v]) =>
        formData.append(k, v as string),
      );

      Object.entries(notes).forEach(([k, v]) =>
        formData.append(`${k}_notes`, v),
      );

      Object.entries(timeValues).forEach(([k, v]) =>
        formData.append(`${k}_value`, v),
      );

      Object.entries(numberValues).forEach(([k, v]) =>
        formData.append(`${k}_value`, v),
      );

      Object.entries(images).forEach(([k, arr]) => {
        arr.forEach((img: any) => {
          if (img.file) formData.append(`${k}_photos`, img.file);
          else formData.append(`${k}_photos_urls`, img.url);
        });
      });

      const result = await createUpdateInspection(
        formData,
        inspectionId || undefined,
      );
      console.log(333);

      if (result.success) {
        toast.success('Saved');
        router.push('/inspections');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff] dark:bg-blue-950">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <Toaster />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="mb-6">
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 border">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Inspection {inspectionId ? 'Edit' : 'New'}
                </h1>

                {user && (
                  <div className="text-sm text-gray-500 mt-2">
                    Logged in: {user.email}
                  </div>
                )}

                <div className="text-sm mt-2 text-gray-500">
                  {vehicle.regnumber} • {vehicle.type}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {formItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-card rounded-xl shadow-sm border p-5"
            >
              <div className="font-medium mb-3">{item.label}</div>

              {item.type === 'checkbox' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setCheckedItems((p) => ({
                        ...p,
                        [item.name]: 'passed',
                      }))
                    }
                    className="px-4 py-2 rounded bg-green-100 text-green-700"
                  >
                    Pass
                  </button>

                  <button
                    onClick={() =>
                      setCheckedItems((p) => ({
                        ...p,
                        [item.name]: 'failed',
                      }))
                    }
                    className="px-4 py-2 rounded bg-red-100 text-red-700"
                  >
                    Fail
                  </button>
                </div>
              ) : (
                <input
                  disabled={!canEdit}
                  value={
                    item.type === 'time'
                      ? timeValues[item.name] || ''
                      : item.type === 'number'
                        ? numberValues[item.name] || ''
                        : notes[item.name] || ''
                  }
                  onChange={(e) => {
                    if (item.type === 'time')
                      setTimeValues((p) => ({
                        ...p,
                        [item.name]: e.target.value,
                      }));
                    else if (item.type === 'number')
                      setNumberValues((p) => ({
                        ...p,
                        [item.name]: e.target.value,
                      }));
                    else
                      setNotes((p) => ({
                        ...p,
                        [item.name]: e.target.value,
                      }));
                  }}
                  className="w-full border rounded-lg p-2 mt-2"
                />
              )}
            </div>
          ))}
        </div>

        {/* SIGNATURE */}
        <div className="mt-8 bg-white rounded-xl border p-5">
          <div className="font-medium mb-3">Signature</div>

          {signature ? (
            <Image src={signature} alt="sig" width={300} height={120} />
          ) : canEdit ? (
            <SignatureCanvas
              ref={sigPadRef}
              canvasProps={{
                className: 'border w-full h-32',
              }}
            />
          ) : null}
        </div>

        {/* SUBMIT */}
        {canEdit && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              {isSubmitting ? 'Saving...' : 'Submit Inspection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
