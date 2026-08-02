"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// SWR fetcher logic
const fetcherFull = async (args: [string, string, string]) => {
  const [url, token, branchId] = args;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Branch-ID": branchId,
    },
  });
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json();
};

const getStoredBranchId = (): string => {
  const pathParts = window.location.pathname.split("/");
  const domain = pathParts[1] !== "dashboard" ? pathParts[1] : "";
  const key = domain ? `active_branch_id_${domain}` : "active_branch_id";
  return (
    localStorage.getItem(key) || localStorage.getItem("active_branch_id") || ""
  );
};

type TableData = {
  id: string;
  table_number: string;
  capacity: number;
  status: number; // 0=Available, 1=Reserved, 2=Occupied
  section: {
    id: string;
    name: string;
  };
};

export default function QRMenuClient({
  token,
  apiUrl,
  tenantSlug,
  branchSlug,
}: {
  token: string;
  apiUrl: string;
  tenantSlug: string;
  branchSlug: string;
}) {
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  useEffect(() => {
    const id = getStoredBranchId();
    setActiveBranchId(id);
    const handleStorage = () => setActiveBranchId(getStoredBranchId());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const queryParams = new URLSearchParams({
    page: "1",
    limit: "100", // Fetch enough tables for QR generation
  });

  const { data: tablesRes, isLoading } = useSWR(
    activeBranchId !== null
      ? [
          `${apiUrl.replace('/v1', '/v2')}/management/tables?${queryParams.toString()}`,
          token,
          activeBranchId,
        ]
      : null,
    fetcherFull,
  );

  const { data: branchRes } = useSWR(
    activeBranchId !== null
      ? [
          `${apiUrl}/management/tenant/branches/${activeBranchId}`,
          token,
          activeBranchId,
        ]
      : null,
    fetcherFull,
  );

  const isBranchLoading = activeBranchId !== null && !branchRes;
  const isLoadingComplete = !isLoading && !isBranchLoading;

  const tables: TableData[] = tablesRes?.data || [];
  const activeBranchSlug = branchRes?.data?.slug || branchSlug; // Should have the real slug now

  const handleDownloadQR = (table: TableData) => {
    const svgElement = document.getElementById(`qr-code-${table.id}`) as any;
    if (!svgElement) return;

    // Convert SVG to string
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    // Create image payload
    const image = new Image();
    image.src =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    image.onload = () => {
      // Draw to canvas
      const canvas = document.createElement("canvas");
      canvas.width = image.width + 40; // Add padding
      canvas.height = image.height + 40;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 20, 20); // 20px padding

        // Trigger download
        const imgURL = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = imgURL;
        a.download = `QR-Menu-${table.table_number}.png`;
        a.click();
      }
    };
  };

  return (
    <div className="mx-auto">
      <div className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm flex flex-col gap-4 px-6 md:px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">
            QR Menu Management
          </h1>
          <p className="text-slate-500 mt-1">
            Download QR codes for your tables to enable self-ordering.
          </p>
        </div>
        </div>
    <div className="p-6 md:p-8">
        {isLoadingComplete === false ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading mb-1">
              No Tables Found
            </h3>
            <p className="text-slate-500">
              Create tables in the Tables management page first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => {
              // Build the dynamic ordering URL
              // e.g. https://domain.com/kopi-kenangan/sudirman?mode=dinein&tableNumber=Meja-1&id=UUID
              const orderUrl = `${window.location.origin}/${tenantSlug}/${activeBranchSlug}?mode=dinein&tableNumber=${encodeURIComponent(
                table.table_number,
              )}&id=${table.id}`;

              return (
                <div
                  key={table.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center shadow-sm"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 text-center font-heading">
                      {table.table_number}
                    </h3>
                    <p className="text-xs text-slate-500 text-center">
                      {table.section?.name || "Main Area"} • {table.capacity}{" "}
                      Seats
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl mb-6">
                    <QRCodeSVG
                      id={`qr-code-${table.id}`}
                      value={orderUrl}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <button
                    onClick={() => handleDownloadQR(table)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh QR
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
