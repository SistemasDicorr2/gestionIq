// supabase/functions/b2-presigned-url/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// --- CABECERAS CORS ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- CONFIGURACIÓN DE R2 ---
const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID")!;
const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
const R2_BUCKET_NAME = Deno.env.get("R2_BUCKET_NAME")!;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { action, objectKey: keyToDelete, area, contentType, owner, extension, isThumb, baseName } = payload;

    // --- ACCIÓN DE ELIMINACIÓN DIRECTA DE OBJETO EN R2 ---
    if (action === 'delete' && keyToDelete) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: keyToDelete,
      });
      await s3Client.send(deleteCommand);

      return new Response(
        JSON.stringify({ success: true, deletedKey: keyToDelete }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // --- GENERACIÓN DE URL FIRMADA PARA SUBIDA ---
    if (!area || !contentType || !extension || !baseName) {
      throw new Error("Faltan parámetros requeridos (area, contentType, extension, baseName).");
    }

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const finalName = isThumb ? `${baseName}_thumb` : baseName;
    
    let objectKey = `${area}/${finalName}.${extension}`;
    if (area === 'logistica') {
      objectKey = `logistica/${timestamp}/${finalName}.${extension}`;
    } else if (area === 'instrumentadores') {
      objectKey = `instrumentadores/${owner}/comprobantes/${finalName}.${extension}`;
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return new Response(
      JSON.stringify({ uploadUrl, objectKey }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("!!! ERROR EN LA EDGE FUNCTION b2-presigned-url !!!", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor.", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});