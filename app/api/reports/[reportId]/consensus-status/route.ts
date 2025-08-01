import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    console.log("API: Starting consensus status update...");
    
    const { reportId } = await params;
    console.log("API: Report ID:", reportId);
    
    const body = await request.json();
    console.log("API: Request body:", body);
    
    const { consensusStatus } = body;
    console.log("API: Consensus status to set:", consensusStatus);

    console.log("API: Updating consensus status for report:", reportId, "to:", consensusStatus);

    // Verificar autenticación
    console.log("API: Checking authentication...");
    const session = await getServerSession(authOptions);
    console.log("API: Session:", session);
    
    if (!session?.user) {
      console.log("API: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("API: User authenticated:", session.user.id);

    // Verificar que el usuario es admin o super admin
    console.log("API: Checking user permissions...");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    console.log("API: User found:", user ? "Yes" : "No");
    if (!user) {
      console.log("API: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar permisos de administrador
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    
    // Verificar si es admin de algún workgroup
    const workgroupMemberships = await prisma.workGroupMember.findMany({
      where: {
        userId: session.user.id,
        role: {
          in: ["ADMIN", "SUPER_ADMIN"]
        }
      }
    });
    
    const isWorkgroupAdmin = workgroupMemberships.length > 0;

    console.log("API: User role:", user.role, "isAdmin:", isAdmin, "isWorkgroupAdmin:", isWorkgroupAdmin);

    if (!isAdmin && !isWorkgroupAdmin) {
      console.log("API: Insufficient permissions");
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Verificar que el reporte existe
    console.log("API: Checking if report exists...");
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId },
      include: {
        votingRounds: {
          where: { status: "ACTIVA" }
        }
      }
    });

    console.log("API: Report found:", report ? "Yes" : "No");
    if (!report) {
      console.log("API: Report not found");
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    console.log("API: Report found:", report.id);

    // Validar el estado de consenso
    const validStatuses = ["CONSENSED", "REJECTED"];
    console.log("API: Valid statuses:", validStatuses);
    console.log("API: Requested status:", consensusStatus);
    
    if (validStatuses.indexOf(consensusStatus) === -1) {
      console.log("API: Invalid consensus status");
      return NextResponse.json({ error: "Invalid consensus status" }, { status: 400 });
    }

    // Si se marca como CONSENSED, verificar que no hay objeciones válidas
    if (consensusStatus === "CONSENSED") {
      console.log("API: Checking for valid objections...");
      const validObjections = await prisma.objection.findMany({
        where: {
          status: "VALIDA",
          vote: {
            round: {
              reportId,
              status: "ACTIVA"
            }
          }
        }
      });

      console.log("API: Found valid objections:", validObjections.length);

      if (validObjections.length > 0) {
        console.log("API: Cannot mark as CONSENSED with valid objections");
        return NextResponse.json({ 
          error: "Cannot mark as CONSENSED while there are valid objections" 
        }, { status: 400 });
      }
    }

    // Actualizar el estado de consenso del reporte
    console.log("API: Updating report consensus status...");
    const updatedReport = await prisma.quarterlyReport.update({
      where: { id: reportId },
      data: { consensusStatus }
    });

    console.log("API: Report updated successfully:", updatedReport.id);

    // Si se marca como CONSENSED, cerrar la ronda activa
    if (consensusStatus === "CONSENSED" && report.votingRounds.length > 0) {
      console.log("API: Closing active voting round...");
      await prisma.votingRound.update({
        where: { id: report.votingRounds[0].id },
        data: { status: "CERRADA" }
      });
      console.log("API: Voting round closed successfully");
    }

    console.log("API: Consensus status updated successfully");

    return NextResponse.json({ 
      success: true, 
      consensusStatus: updatedReport.consensusStatus 
    });
  } catch (error) {
    console.error("Error updating consensus status:", error);
    console.error("Error name:", error instanceof Error ? error.name : "Unknown");
    console.error("Error message:", error instanceof Error ? error.message : "No message");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Log additional details for debugging
    if (error instanceof Error) {
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 