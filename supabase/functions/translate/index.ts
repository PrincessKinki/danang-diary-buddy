import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map language codes to Google Translate codes
const langCodeMap: Record<string, string> = {
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW', // Use Traditional Chinese for Cantonese
  'vi': 'vi',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko',
  'th': 'th',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const source = langCodeMap[sourceLang] || sourceLang;
    const target = langCodeMap[targetLang] || targetLang;

    // Use Google Translate API (free tier via translate.googleapis.com)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract translated text from the response
    // The response format is: [[["translated text","original text",null,null,10]],null,"source_lang"]
    let translatedText = '';
    if (data && data[0]) {
      translatedText = data[0].map((item: any[]) => item[0]).join('');
    }

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Translation error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
