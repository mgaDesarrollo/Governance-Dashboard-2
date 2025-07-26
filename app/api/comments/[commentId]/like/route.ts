import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Verificar que el usuario no haya dado like ya
    if (comment.likes.includes(session.user.id)) {
      return NextResponse.json({ error: "Already liked" }, { status: 400 });
    }

    // Remover dislike si existe
    const updatedDislikes = comment.dislikes.filter(id => id !== session.user.id);
    
    // Agregar like
    const updatedLikes = [...comment.likes, session.user.id];

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
    console.error("Error liking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 