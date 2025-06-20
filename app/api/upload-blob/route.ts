import { NextResponse, type NextRequest } from "next/server"
import { put, del } from "@vercel/blob"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")
  const uploadType = searchParams.get("uploadType") // 'avatar' o 'cv'

  if (!filename || !request.body) {
    return NextResponse.json({ error: "No filename or file body provided" }, { status: 400 })
  }

  let contentType: string | undefined
  let allowedExtensions: string[] = []
  let pathPrefix = "misc/" // Default prefix

  if (uploadType === "avatar") {
    contentType = request.headers.get("content-type") || "image/*" // El cliente debería enviar el tipo exacto
    allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    pathPrefix = `users/${session.user.id}/avatars/`
  } else if (uploadType === "cv") {
    contentType = request.headers.get("content-type") || "application/pdf"
    allowedExtensions = [".pdf"]
    pathPrefix = `users/${session.user.id}/cvs/`
  } else {
    return NextResponse.json({ error: "Invalid upload type specified" }, { status: 400 })
  }

  const fileExtension = filename.slice(filename.lastIndexOf(".")).toLowerCase()
  if (!allowedExtensions.includes(fileExtension)) {
    return NextResponse.json(
      { error: `Invalid file type for ${uploadType}. Allowed: ${allowedExtensions.join(", ")}` },
      { status: 400 },
    )
  }

  // Crear un nombre de archivo único para evitar colisiones y problemas de caché
  // Usar el nombre original del archivo sanitizado + timestamp/hash
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_")
  const uniqueFilename = `${pathPrefix}${Date.now()}-${sanitizedFilename}`

  try {
    const blob = await put(uniqueFilename, request.body, {
      access: "public", // Los avatares y CVs suelen ser públicos
      contentType: contentType, // Es importante pasar el contentType correcto
      // addRandomSuffix: true, // Vercel Blob añade un sufijo aleatorio por defecto, lo cual es bueno.
    })

    return NextResponse.json(blob) // Devuelve { url, pathname, contentType, contentDisposition }
  } catch (error: any) {
    console.error(`Error uploading ${uploadType} to Vercel Blob:`, error)
    return NextResponse.json({ error: `Failed to upload ${uploadType}`, details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const blobUrl = searchParams.get("url")

  if (!blobUrl) {
    return NextResponse.json({ error: "No blob URL provided for deletion" }, { status: 400 })
  }

  // Validar que la URL sea de Vercel Blob y pertenezca al usuario (opcional pero recomendado)
  // ej. if (!blobUrl.startsWith('https://[your-blob-id].public.blob.vercel-storage.com/users/' + session.user.id)) { ... }

  try {
    await del(blobUrl)
    return NextResponse.json({ success: true, message: "File deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting Vercel Blob file:", error)
    return NextResponse.json({ error: "Failed to delete file", details: error.message }, { status: 500 })
  }
}
