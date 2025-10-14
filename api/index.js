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
    
    // 如果是浏览器请求且没有参数，显示 API 文档页面
    if (isBrowserRequest && (!username || !password || !from_date || !to_date)) {
      const htmlPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advertising Report API 代理服务</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 100vh;
        }
        .header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 2px solid #4285f4;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4285f4;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #4285f4;
        }
        .section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.4em;
        }
        .param-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .param-table th, .param-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .param-table th {
            background: #4285f4;
            color: white;
        }
        .param-table tr:nth-child(even) {
            background: #f2f2f2;
        }
        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 14px;
        }
        .example-form {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #4285f4;
            margin: 20px 0;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .test-btn {
            background: #4285f4;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        }
        .test-btn:hover {
            background: #3367d6;
        }
        .required {
            color: #e74c3c;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            display: none;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .result-area {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            display: none;
        }
        .result-area pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔌 Advertising Report API 代理服务</h1>
            <p>数据转接服务 - 代理外部 API 数据请求</p>
        </div>

        <div class="section">
            <h2>📋 API 说明</h2>
            <p>本服务提供 Google AdX 数据的代理访问功能，将您的请求转发到数据源 API 并返回结果。</p>
            
            <h3 style="margin-top: 20px;">接口地址</h3>
            <div class="code-block">GET ${req.headers.host ? `https://${req.headers.host}` : 'https://advertisingreport.net'}/api</div>
        </div>

        <div class="section">
            <h2>📝 请求参数</h2>
            <table class="param-table">
                <thead>
                    <tr>
                        <th>参数名</th>
                        <th>类型</th>
                        <th>必填</th>
                        <th>说明</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>username</td>
                        <td>string</td>
                        <td><span class="required">✅ 必填</span></td>
                        <td>用户名</td>
                    </tr>
                    <tr>
                        <td>password</td>
                        <td>string</td>
                        <td><span class="required">✅ 必填</span></td>
                        <td>密码</td>
                    </tr>
                    <tr>
                        <td>from_date</td>
                        <td>string</td>
                        <td><span class="required">✅ 必填</span></td>
                        <td>开始日期 (YYYY-MM-DD)</td>
                    </tr>
                    <tr>
                        <td>to_date</td>
                        <td>string</td>
                        <td><span class="required">✅ 必填</span></td>
                        <td>结束日期 (YYYY-MM-DD)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🧪 在线测试</h2>
            <div class="example-form">
                <div class="form-group">
                    <label for="username">用户名 <span class="required">*</span></label>
                    <input type="text" id="username" name="username" placeholder="请输入用户名">
                </div>
                <div class="form-group">
                    <label for="password">密码 <span class="required">*</span></label>
                    <input type="password" id="password" name="password" placeholder="请输入密码">
                </div>
                <div class="form-group">
                    <label for="from_date">开始日期 <span class="required">*</span></label>
                    <input type="date" id="from_date" name="from_date">
                </div>
                <div class="form-group">
                    <label for="to_date">结束日期 <span class="required">*</span></label>
                    <input type="date" id="to_date" name="to_date">
                </div>
                <button class="test-btn" onclick="testAPI()">🚀 测试 API</button>
                <div class="status" id="status"></div>
                <div class="result-area" id="result">
                    <h4>响应结果：</h4>
                    <pre id="result-content"></pre>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>💡 使用示例</h2>
            <div class="code-block">curl "${req.headers.host ? `https://${req.headers.host}` : 'https://advertisingreport.net'}/api?username=your_username&password=your_password&from_date=2025-10-07&to_date=2025-10-14"</div>
        </div>

        <div class="section">
            <h2>📄 技术信息</h2>
            <ul>
                <li><strong>数据源：</strong> api.adoptima.net</li>
                <li><strong>支持格式：</strong> JSON</li>
                <li><strong>CORS：</strong> 已启用</li>
                <li><strong>缓存：</strong> 无缓存</li>
                <li><strong>超时：</strong> 30秒</li>
            </ul>
        </div>
    </div>

    <script>
        // 设置默认日期
        document.getElementById('from_date').value = '2025-10-07';
        document.getElementById('to_date').value = '2025-10-14';

        async function testAPI() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const from_date = document.getElementById('from_date').value;
            const to_date = document.getElementById('to_date').value;
            
            const status = document.getElementById('status');
            const result = document.getElementById('result');
            const resultContent = document.getElementById('result-content');
            
            if (!username || !password || !from_date || !to_date) {
                status.className = 'status error';
                status.style.display = 'block';
                status.textContent = '请填写所有必填参数';
                return;
            }
            
            status.className = 'status';
            status.style.display = 'block';
            status.textContent = '请求中...';
            result.style.display = 'none';
            
            try {
                const url = \`/api?username=\${encodeURIComponent(username)}&password=\${encodeURIComponent(password)}&from_date=\${from_date}&to_date=\${to_date}\`;
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    status.className = 'status success';
                    status.textContent = \`请求成功 (状态码: \${response.status})\`;
                    resultContent.textContent = JSON.stringify(data, null, 2);
                    result.style.display = 'block';
                } else {
                    status.className = 'status error';
                    status.textContent = \`请求失败 (状态码: \${response.status})\`;
                    resultContent.textContent = JSON.stringify(data, null, 2);
                    result.style.display = 'block';
                }
            } catch (error) {
                status.className = 'status error';
                status.textContent = '请求失败: ' + error.message;
                resultContent.textContent = error.stack;
                result.style.display = 'block';
            }
        }
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(htmlPage);
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
    
    // 如果是浏览器请求，返回格式化的 HTML 页面
    if (isBrowserRequest) {
      const htmlResult = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API 结果 - Advertising Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #4285f4; margin-bottom: 20px; }
        .header h1 { color: #4285f4; }
        .info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        .data-table th { background: #4285f4; color: white; }
        .data-table tr:nth-child(even) { background: #f2f2f2; }
        .json-raw { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .json-raw pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #4285f4; }
        .summary-card .number { font-size: 24px; font-weight: bold; color: #333; }
        .back-btn { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
        .back-btn:hover { background: #3367d6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Advertising Report API 结果</h1>
            <p>数据获取时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <button class="back-btn" onclick="window.location.href='/api'">← 返回 API 文档</button>
        
        <div class="info">
            <strong>请求参数:</strong> 
            用户名: ${username} | 日期范围: ${from_date} 至 ${to_date} | 
            数据条数: ${Array.isArray(data) ? data.length : 0}
        </div>
        
        ${Array.isArray(data) && data.length > 0 ? `
        <div class="summary">
            <div class="summary-card">
                <h3>总记录数</h3>
                <div class="number">${data.length}</div>
            </div>
            <div class="summary-card">
                <h3>总收入</h3>
                <div class="number">$${data.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0).toFixed(4)}</div>
            </div>
            <div class="summary-card">
                <h3>总展示数</h3>
                <div class="number">${data.reduce((sum, item) => sum + parseInt(item.impressions || 0), 0).toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h3>总点击数</h3>
                <div class="number">${data.reduce((sum, item) => sum + parseInt(item.clicks || 0), 0).toLocaleString()}</div>
            </div>
        </div>
        
        <h3>📋 详细数据</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>日期</th>
                    <th>站点</th>
                    <th>广告单元</th>
                    <th>展示数</th>
                    <th>点击数</th>
                    <th>eCPM</th>
                    <th>收入</th>
                    <th>请求数</th>
                    <th>匹配率</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                <tr>
                    <td>${item.date || '-'}</td>
                    <td>${item.site || '-'}</td>
                    <td>${item.adunit || '-'}</td>
                    <td>${item.impressions || '0'}</td>
                    <td>${item.clicks || '0'}</td>
                    <td>${item.ecpm || '0'}</td>
                    <td>$${item.revenue || '0'}</td>
                    <td>${item.ad_request || '0'}</td>
                    <td>${item.match_rate ? parseFloat(item.match_rate).toFixed(2) + '%' : '0%'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : `
        <div style="text-align: center; padding: 40px; color: #666;">
            <h3>📭 暂无数据</h3>
            <p>指定日期范围内没有找到数据记录</p>
        </div>
        `}
        
        <h3 style="margin-top: 30px;">🔧 原始 JSON 数据</h3>
        <div class="json-raw">
            <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
    </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(htmlResult);
    }
    
    // 对于 API 请求，返回 JSON 数据
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