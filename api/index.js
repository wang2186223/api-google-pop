export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 从查询参数中获取参数
    const { username, password, from_date, to_date } = req.query;
    
    // 验证必需参数
    if (!username || !password || !from_date || !to_date) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['username', 'password', 'from_date', 'to_date'],
        received: { username, password, from_date, to_date }
      });
    }
    
    // 构建目标 API URL
    const targetUrl = new URL('https://api.adoptima.net/get_app_data/get_adx');
    targetUrl.searchParams.set('username', username);
    targetUrl.searchParams.set('password', password);
    targetUrl.searchParams.set('from_date', from_date);
    targetUrl.searchParams.set('to_date', to_date);
    
    console.log('Fetching data from:', targetUrl.toString());
    
    // 发起请求到目标 API
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'ADX-Google-Proxy/1.0',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('Target API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Target API error',
        status: response.status,
        statusText: response.statusText 
      });
    }
    
    // 获取响应数据
    const data = await response.json();
    
    // 添加代理信息头
    res.setHeader('X-Proxy-By', 'ADX-Google-Proxy');
    res.setHeader('X-Data-Source', 'api.adoptima.net');
    res.setHeader('Content-Type', 'application/json');
    
    // 返回数据
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}