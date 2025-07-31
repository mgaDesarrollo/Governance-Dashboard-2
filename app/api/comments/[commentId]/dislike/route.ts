import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    console.log("API: Disliking comment:", commentId);

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("API: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el comentario existe
    const comment = await prisma.consensusComment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      console.log("API: Comment not found");
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verificar si el usuario ya dio dislike
    const existingDislike = await prisma.consensusComment.findFirst({
      where: {
        id: commentId,
        dislikes: {
          has: session.user.id
        }
      }
    });

    if (existingDislike) {
      // Remover dislike
      const updatedComment = await prisma.consensusComment.update({
        where: { id: commentId },
        data: {
          dislikes: {
            set: comment.dislikes.filter(id => id !== session.user.id)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      console.log("API: Dislike removed successfully");

      return NextResponse.json({ 
        success: true, 
        disliked: false,
        comment: updatedComment 
      });
    } else {
      // Agregar dislike y remover like si existe
      const updatedComment = await prisma.consensusComment.update({
        where: { id: commentId },
        data: {
          dislikes: {
            push: session.user.id
          },
          likes: {
            set: comment.likes.filter(id => id !== session.user.id)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      console.log("API: Dislike added successfully");

      return NextResponse.json({ 
        success: true, 
        disliked: true,
        comment: updatedComment 
      });
    }
  } catch (error) {
    console.error("Error disliking comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 