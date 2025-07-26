import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = params;

    // Verificar que el comentario existe
    const comment = await prisma.consensusComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verificar que el usuario no haya dado dislike ya
    if (comment.dislikes.includes(session.user.id)) {
      return NextResponse.json({ error: "Already disliked" }, { status: 400 });
    }

    // Remover like si existe
    const updatedLikes = comment.likes.filter(id => id !== session.user.id);
    
    // Agregar dislike
    const updatedDislikes = [...comment.dislikes, session.user.id];

    // Actualizar el comentario
    const updatedComment = await prisma.consensusComment.update({
      where: { id: commentId },
      data: {
        likes: updatedLikes,
        dislikes: updatedDislikes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error disliking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 