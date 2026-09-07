import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { getPrisma } from '@/lib/prisma';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const payload =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const fullName =
      typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
    const email =
      typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const phoneNumber =
      typeof payload.phoneNumber === 'string' ? payload.phoneNumber.trim() : '';

    // Validate required fields
    if (!fullName || !email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (fullName.length > 120) {
      return NextResponse.json(
        { error: 'Full name is too long' },
        { status: 400 }
      );
    }

    // Validate email format
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!PHONE_PATTERN.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Check if email already exists
    const existingMember = await prisma.waitlistMember.findUnique({
      where: { email },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Email already registered', position: existingMember.position },
        { status: 409 }
      );
    }

    // PostgreSQL assigns the position from a sequence, avoiding duplicates
    // when multiple people submit at the same time.
    const member = await prisma.waitlistMember.create({
      data: {
        fullName,
        email,
        phoneNumber,
      },
    });

    return NextResponse.json(
      { success: true, position: member.position, id: member.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist API Error:', error);
    
    // Handle unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }

    const response: { error: string; details?: string } = {
      error: 'Internal server error',
    };

    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
      response.details = error.message;
    }

    return NextResponse.json(response, { status: 500 });
  }
}
