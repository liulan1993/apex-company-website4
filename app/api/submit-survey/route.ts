// 文件路径: app/api/submit-survey/route.ts
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let client;
  try {
    client = await db.connect();
  } catch (error) {
    console.error('数据库连接失败:', error);
    return NextResponse.json(
      { message: 'Database connection failed' },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();
    const { id, submittedAt, answers } = data;

    if (!id || !answers) {
      return NextResponse.json(
        { message: '缺少 ID 或答案数据' },
        { status: 400 }
      );
    }

    await client.sql`
      INSERT INTO survey_responses (id, submitted_at, answers)
      VALUES (${id}, ${submittedAt}, ${JSON.stringify(answers)});
    `;

    client.release();
    return NextResponse.json({ message: '问卷提交成功' }, { status: 200 });

  } catch (error) {
    console.error('数据插入失败:', error);
    if(client) client.release();
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: '数据插入失败', error: errorMessage },
      { status: 500 }
    );
  }
}