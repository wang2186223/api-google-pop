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
            max-width: 100%; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow-x: auto;
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
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            border: 1px solid #dee2e6;
            font-size: 12px;
        }
        .data-table th, .data-table td { 
            border: 1px solid #dee2e6; 
            padding: 8px; 
            text-align: left;
            white-space: nowrap;
        }
        .data-table th { 
            background: #007bff; 
            color: white;
            font-weight: 600;
            position: sticky;
            top: 0;
        }
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
            font-size: 14px;
        }
        .record-count {
            text-align: center;
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Advertising Report</h1>
            <div class="period">Period: ${from_date} - ${to_date}</div>
        </div>
        
        <div class="record-count">
            Total Records: ${Array.isArray(data) ? data.length : 0}
        </div>
        
        ${Array.isArray(data) && data.length > 0 ? `
        <table class="data-table">
            <thead>
                <tr>
                    <th>date</th>
                    <th>site</th>
                    <th>url</th>
                    <th>adunit</th>
                    <th>ad_unit_1</th>
                    <th>ad_unit_code</th>
                    <th>clicks</th>
                    <th>impressions</th>
                    <th>ecpm</th>
                    <th>ad_request</th>
                    <th>responses_served</th>
                    <th>match_rate</th>
                    <th>total_active_view_measurable_imp</th>
                    <th>revenue</th>
                    <th>country</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                <tr>
                    <td>${item.date || ''}</td>
                    <td>${item.site || ''}</td>
                    <td>${item.url || ''}</td>
                    <td>${item.adunit || ''}</td>
                    <td>${item.ad_unit_1 || ''}</td>
                    <td>${item.ad_unit_code || ''}</td>
                    <td>${item.clicks || ''}</td>
                    <td>${item.impressions || ''}</td>
                    <td>${item.ecpm || ''}</td>
                    <td>${item.ad_request || ''}</td>
                    <td>${item.responses_served || ''}</td>
                    <td>${item.match_rate || ''}</td>
                    <td>${item.total_active_view_measurable_imp || ''}</td>
                    <td>${item.revenue || ''}</td>
                    <td>${item.country || ''}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : `
        <div style="text-align: center; padding: 40px; color: #666;">
            <h3>📭 No Data</h3>
            <p>No data found for the specified date range</p>
        </div>
        `}
        
        <div class="footer">
            Report generated at ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(htmlResult);
    }
    
    // 对于 API 请求，返回原始 JSON 数据
    res.setHeader('X-Proxy-By', 'Advertising-Report-Proxy');
    res.setHeader('X-Data-Source', 'api.adoptima.net');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}