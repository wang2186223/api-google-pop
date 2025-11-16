export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
  
  // API 配置
  const API_URL = 'https://api-prod.adsentri.com/api/gamebridge/v1/ssp/report';
  const API_TOKEN = '2323f8fc81c4941726d7b58fa8614d73';
  const REVENUE_FACTOR = 0.7;
  
  // 检查是否是浏览器请求
  const acceptHeader = req.headers.accept || '';
  const isBrowserRequest = acceptHeader.includes('text/html');
  
  try {
    // 从查询参数中获取参数
    const { 
      start_date, 
      end_date, 
      dimensions, 
      page, 
      size, 
      device, 
      format, 
      country, 
      site, 
      zone, 
      channel 
    } = req.query;
    
    // 如果是浏览器请求且没有必需参数，显示空白页面
    if (isBrowserRequest && (!start_date || !end_date)) {
      const blankPage = `<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Advertising Report</title><style>body{margin:0;padding:0;background:#fff;height:100vh}</style></head><body></body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(blankPage);
    }
    
    // 验证必需参数
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required parameters: start_date and end_date'
      });
    }
    
    // 构建请求体
    const requestBody = {
      date_range: {
        start: start_date,
        end: end_date
      },
      dimensions: dimensions ? dimensions.split(',') : ['Date'],
      sorts: { Date: -1 },
      page_index: parseInt(page || '1'),
      page_size: parseInt(size || '100'),
      filters: {}
    };
    
    // 添加可选过滤器
    if (device) requestBody.filters.Device = device.split(',');
    if (format) requestBody.filters.AdFormat = format.split(',');
    if (country) requestBody.filters.Country = country.split(',');
    if (site) requestBody.filters.SiteId = site.split(',');
    if (zone) requestBody.filters.Zone = zone.split(',');
    if (channel) requestBody.filters.Channel = channel.split(',');
    
    // 发起请求到 adsentri API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_TOKEN
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'API request failed',
        status: response.status
      });
    }
    
    // 获取响应数据
    const result = await response.json();
    
    // 检查 API 返回的错误
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    const apiData = result.data?.rows || [];
    const totalRows = result.data?.total_rows || {};
    
    // 数据处理函数 - 调整 NetRevenue 和 ECpm
    const processedData = apiData.map(item => {
      const processed = { ...item };
      
      // 处理 NetRevenue: 乘以 0.7
      if (item.NetRevenue) {
        const originalRevenue = parseFloat(item.NetRevenue);
        const adjustedRevenue = originalRevenue * REVENUE_FACTOR;
        processed.NetRevenue = adjustedRevenue.toFixed(2);
        
        // 重新计算 ECpm: (调整后的revenue / impressions) * 1000
        const impressions = parseInt(item.Impressions || 0);
        if (impressions > 0) {
          processed.ECpm = ((adjustedRevenue / impressions) * 1000).toFixed(4);
        }
      }
      
      return processed;
    });
    
    // 如果是浏览器请求，返回 HTML 表格
    if (isBrowserRequest) {
      // 生成表格行
      const tableHeaders = Object.keys(processedData[0] || {});
      const tableRows = processedData.map(item => 
        `<tr>${tableHeaders.map(key => `<td>${item[key] || ''}</td>`).join('')}</tr>`
      ).join('');
      
      // 生成表头
      const tableHeaderRow = `<tr>${tableHeaders.map(key => `<th>${key}</th>`).join('')}</tr>`;
      
      // 生成CSV数据
      const csvData = [
        tableHeaders.join(','),
        ...processedData.map(item => 
          tableHeaders.map(key => {
            const value = String(item[key] || '');
            return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(',')
        )
      ].join('\\n');
      
      const htmlResult = `<!DOCTYPE html><html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Report - ${start_date} to ${end_date}</title><style>body{font-family:Arial,sans-serif;margin:20px;background:#f8f9fa;color:#333}.container{max-width:100%;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);overflow-x:auto}.header{text-align:center;padding:20px 0;border-bottom:2px solid #007bff;margin-bottom:30px}.header h1{color:#007bff;margin:0;font-size:24px}.period{color:#666;margin-top:5px}.data-table{width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #dee2e6;font-size:12px}.data-table th,.data-table td{border:1px solid #dee2e6;padding:8px;text-align:left;white-space:nowrap}.data-table th{background:#007bff;color:white;font-weight:600;position:sticky;top:0}.data-table tr:nth-child(even){background:#f8f9fa}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #dee2e6;color:#666;font-size:14px}.record-count{text-align:center;margin-bottom:20px;font-size:16px;font-weight:bold;color:#007bff}.download-btn{background:#28a745;color:white;padding:12px 24px;border:none;border-radius:6px;cursor:pointer;font-size:14px;margin:10px;text-decoration:none;display:inline-block}.download-btn:hover{background:#218838}</style></head><body><div class="container"><div class="header"><h1>📊 Advertising Report</h1><div class="period">Period: ${start_date} - ${end_date}</div></div><div class="record-count">Total Records: ${processedData.length} <button class="download-btn" onclick="downloadCSV()">📥 Download CSV</button></div>${processedData.length > 0 ? `<table class="data-table"><thead>${tableHeaderRow}</thead><tbody>${tableRows}</tbody></table>` : `<div style="text-align:center;padding:40px;color:#666"><h3>📭 No Data</h3><p>No data found for the specified parameters</p></div>`}<div class="footer">Report generated at ${new Date().toLocaleString()}</div></div><script>function downloadCSV(){const csvContent="${csvData.replace(/"/g, '\\"')}";const blob=new Blob([csvContent],{type:'text/csv;charset=utf-8;'});const link=document.createElement('a');if(link.download!==undefined){const url=URL.createObjectURL(blob);link.setAttribute('href',url);link.setAttribute('download','advertising-report-${start_date}-${end_date}.csv');link.style.visibility='hidden';document.body.appendChild(link);link.click();document.body.removeChild(link);}}</script></body></html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(htmlResult);
    }
    
    // 对于 API 请求，返回 JSON 数据
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      data: processedData,
      total: result.data?.total || 0,
      page_index: result.data?.page_index || 1,
      page_size: result.data?.page_size || 100
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: 'Service temporarily unavailable'
    });
  }
}
