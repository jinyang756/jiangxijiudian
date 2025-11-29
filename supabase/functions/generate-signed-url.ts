// supabase/functions/generate-signed-url.ts
// Edge Function用于安全地生成签名URL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log("generate-signed-url function started");

serve(async (req) => {
  try {
    // 从请求中获取参数
    const { bucket, path, expiresIn } = await req.json();
    
    // 验证参数
    if (!bucket || !path) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: bucket and path" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // 使用服务角色密钥创建Supabase客户端（仅在Edge Function中安全）
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // 生成签名URL
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn || 60);
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // 返回签名URL
    return new Response(
      JSON.stringify({ signedUrl: data.signedUrl }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});