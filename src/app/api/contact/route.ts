import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // Save to database
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      },
    });

    // Send email via Resend
    const contactEmail = process.env.CONTACT_EMAIL || "hello@mariemeister.com";

    try {
      await resend.emails.send({
        from: "Marie Meister Website <onboarding@resend.dev>",
        to: contactEmail,
        subject: `New Contact: ${data.subject || "No Subject"} - from ${data.name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111; font-weight: normal;">New Contact Message</h2>
            <hr style="border: none; border-top: 1px solid #e5e5e5;" />
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line; color: #222;">${data.message}</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5;" />
            <p style="color: #999; font-size: 12px;">Sent from mariemeister.com contact form</p>
          </div>
        `,
        replyTo: data.email,
      });
    } catch (emailError) {
      // Email sending failed but message is saved in DB
      console.error("Email sending failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
