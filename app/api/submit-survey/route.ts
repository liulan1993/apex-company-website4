// 文件路径: app/api/submit-survey/route.ts
// 这个版本增加了详细的日志记录，以帮助调试部署后的问题。

import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("API路由被调用 /api/submit-survey");
  let client;

  // 步骤 1: 尝试连接数据库
  try {
    console.log("正在尝试连接数据库...");
    client = await db.connect();
    console.log("数据库连接成功！");
  } catch (error) {
    console.error('数据库连接失败:', error);
    // 返回一个详细的错误响应
    return NextResponse.json(
      { message: 'Database connection failed.', error: (error as Error).message },
      { status: 500 }
    );
  }

  // 步骤 2: 解析请求数据并执行插入操作
  try {
    console.log("正在解析请求中的JSON数据...");
    const data = await request.json();
    const { id, submittedAt, answers } = data;
    console.log("成功解析数据, ID:", id);

    // 验证数据是否存在
    if (!id || !submittedAt || !answers) {
      console.error('验证失败: 缺少必要的数据字段。');
      return NextResponse.json(
        { message: '缺少 ID, submittedAt, 或 answers 数据' },
        { status: 400 }
      );
    }
    
    // 步骤 3: 尝试将数据插入数据表
    console.log("正在执行SQL插入命令...");
    await client.sql`
      INSERT INTO survey_responses (id, submitted_at, answers)
      VALUES (${id}, ${submittedAt}, ${JSON.stringify(answers)});
    `;
    console.log("SQL插入命令执行成功！");

    // 释放客户端连接
    client.release();

    // 步骤 4: 返回成功响应
    console.log("操作成功, 返回200状态码。");
    return NextResponse.json({ message: '问卷提交成功' }, { status: 200 });

  } catch (error) {
    console.error('API路由执行过程中发生错误:', error);
    if(client) {
      client.release(); // 如果发生错误，也要确保释放连接
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: '服务器内部错误', error: errorMessage },
      { status: 500 }
    );
  }
}
