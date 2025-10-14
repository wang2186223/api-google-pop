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
  
  // 检查是否是浏览器请求（Accept 头包含 text/html）
  const acceptHeader = req.headers.accept || '';
  const isBrowserRequest = acceptHeader.includes('text/html');
  
  try {
    // 从查询参数中获取参数
    const { username, password, from_date, to_date } = req.query;
    
    // 如果是浏览器请求且没有参数，显示空白页面
    if (isBrowserRequest && (!username || !password || !from_date || !to_date)) {
      const blankPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advertising Report</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: white;
            height: 100vh;
        }
    </style>
</head>
<body>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(blankPage);
    }
    
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
        'User-Agent': 'Advertising-Report-Proxy/1.0',
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
    
    // 如果是浏览器请求，返回简化的表格
    if (isBrowserRequest) {
      // 简单的加密函数（Base64 + 简单混淆）
      const encryptValue = (value) => {
        const str = String(value);
        const encoded = btoa(str).split('').reverse().join('');
        return encoded.substring(0, 8) + '***';
      };
      
      // 计算汇总数据
      const totalRevenue = Array.isArray(data) ? data.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0) : 0;
      const totalImpressions = Array.isArray(data) ? data.reduce((sum, item) => sum + parseInt(item.impressions || 0), 0) : 0;
      const totalClicks = Array.isArray(data) ? data.reduce((sum, item) => sum + parseInt(item.clicks || 0), 0) : 0;
      const totalRequests = Array.isArray(data) ? data.reduce((sum, item) => sum + parseInt(item.ad_request || 0), 0) : 0;
      
      const htmlResult = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report - ${from_date} to ${to_date}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f8f9fa; 
            color: #333;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            padding: 20px 0; 
            border-bottom: 2px solid #007bff; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            color: #007bff; 
            margin: 0;
            font-size: 24px;
        }
        .period {
            color: #666;
            margin-top: 5px;
        }
        .summary-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            border: 1px solid #dee2e6;
        }
        .summary-table th, .summary-table td { 
            border: 1px solid #dee2e6; 
            padding: 12px; 
            text-align: center;
        }
        .summary-table th { 
            background: #007bff; 
            color: white;
            font-weight: 600;
        }
        .summary-table td {
            font-size: 18px;
            font-weight: 500;
        }
        .revenue { color: #28a745; }
        .impressions { color: #17a2b8; }
        .clicks { color: #ffc107; }
        .requests { color: #6c757d; }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Advertising Report</h1>
            <div class="period">Period: ${from_date} - ${to_date}</div>
        </div>
        
        <table class="summary-table">
            <thead>
                <tr>
                    <th>指标</th>
                    <th>数值</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>总收入</strong></td>
                    <td class="revenue">$${totalRevenue.toFixed(4)}</td>
                </tr>
                <tr>
                    <td><strong>总展示数</strong></td>
                    <td class="impressions">${totalImpressions.toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>总点击数</strong></td>
                    <td class="clicks">${totalClicks.toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>总请求数</strong></td>
                    <td class="requests">${totalRequests.toLocaleString()}</td>
                </tr>
                <tr>
                    <td><strong>数据记录数</strong></td>
                    <td>${Array.isArray(data) ? data.length : 0}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="footer">
            Report generated at ${new Date().toLocaleString('zh-CN')}<br>
            Data ID: ${encryptValue(username + from_date + to_date)}
        </div>
    </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(htmlResult);
    }
    
    // 对于 API 请求，返回加密后的 JSON 数据
    const encryptedData = Array.isArray(data) ? data.map(item => ({
      date: item.date,
      site_hash: btoa(item.site || '').substring(0, 8),
      adunit_hash: btoa(item.adunit || '').substring(0, 8),
      impressions: item.impressions,
      clicks: item.clicks,
      revenue: item.revenue
    })) : [];
    
    res.setHeader('X-Proxy-By', 'Advertising-Report-Proxy');
    res.setHeader('X-Data-Source', 'api.adoptima.net');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json({
      summary: {
        total_revenue: encryptedData.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0),
        total_impressions: encryptedData.reduce((sum, item) => sum + parseInt(item.impressions || 0), 0),
        total_clicks: encryptedData.reduce((sum, item) => sum + parseInt(item.clicks || 0), 0),
        record_count: encryptedData.length
      },
      data: encryptedData
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}