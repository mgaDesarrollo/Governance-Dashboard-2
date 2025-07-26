import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { objectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { objectionId } = params;
    const body = await request.json();
    const { status } = body;

    // Validaciones
    if (!status || !["PENDIENTE", "VALIDA", "INVALIDA"].includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be PENDIENTE, VALIDA, or INVALIDA" 
      }, { status: 400 });
    }

    // Verificar que la objeción existe
    const objection = await prisma.objection.findUnique({
      where: { id: objectionId },
      include: {
        vote: {
          include: {
            report: {
              include: {
                workGroup: {
                  include: {
                    members: {
                      where: {
                        userId: session.user.id,
                        role: "admin"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!objection) {
      return NextResponse.json({ error: "Objection not found" }, { status: 404 });
    }

    // Verificar que el usuario es administrador del workgroup
    const isAdmin = objection.vote.report.workGroup.members.length > 0;
    if (!isAdmin && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only workgroup admins can change objection status" }, { status: 403 });
    }

    // Actualizar el estado de la objeción
    const updatedObjection = await prisma.objection.update({
      where: { id: objectionId },
      data: {
        status,
        resolvedById: session.user.id,
        resolvedAt: new Date()
      },
      include: {
        vote: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        resolvedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(updatedObjection);
  } catch (error) {
    console.error("Error updating objection status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 