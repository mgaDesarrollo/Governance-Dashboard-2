import { supabaseClient, supabaseAdmin, STORAGE_CONFIG } from './supabase-config';

export class StorageService {
  private bucketName = STORAGE_CONFIG.bucketName;
  private userId?: string;
  private isServerSide: boolean;

  constructor(userId?: string) {
    this.userId = userId;
    this.isServerSide = typeof window === 'undefined';
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      // Usar el cliente admin para operaciones del servidor
      const client = this.isServerSide ? supabaseAdmin : supabaseClient;
      
      // Verificar si el bucket existe
      const { data: buckets } = await client.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === this.bucketName);

      if (!bucketExists) {
        // Crear el bucket si no existe
        const { error: createError } = await client.storage.createBucket(this.bucketName, {
          public: false,
          allowedMimeTypes: STORAGE_CONFIG.allowedMimeTypes.all
        });

        if (createError) throw createError;
      }

      console.log('Bucket initialization completed');
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }

  /**
   * Valida el tipo de archivo
   */
  private validateFileType(file: File, type: 'image' | 'document' | 'all' = 'all'): void {
    if (STORAGE_CONFIG.allowedMimeTypes[type].indexOf(file.type) === -1) {
      throw new Error(`Invalid file type. Allowed types: ${STORAGE_CONFIG.allowedMimeTypes[type].join(', ')}`);
    }
  }

  /**
   * Valida el tamaño del archivo
   */
  private validateFileSize(file: File, maxSize: number = STORAGE_CONFIG.maxFileSize): void {
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }
  }

  /**
   * Sube un archivo a Supabase Storage
   */
  async uploadFile(file: File, options: {
    type?: 'image' | 'document' | 'all',
    maxSize?: number,
    folder?: string
  } = {}): Promise<{ url: string; path: string }> {
    try {
      let userId = this.userId;

      if (!userId) {
        if (this.isServerSide) {
          throw new Error('User ID is required for server-side operations');
        }
        
        // Check for client-side authentication if userId wasn't provided in constructor
        const { data: { user: currentUser }, error: sessionError } = await supabaseClient.auth.getUser();
        
        if (sessionError) {
          console.error('Authentication error:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!currentUser) {
          console.error('No authenticated user found');
          throw new Error('No authenticated user found');
        }

        userId = currentUser.id;
      }

      console.log('Starting file upload with options:', { 
        type: options.type,
        maxSize: options.maxSize,
        folder: options.folder,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userId,
        isServerSide: this.isServerSide
      });

      const { type = 'all', maxSize = STORAGE_CONFIG.maxFileSize, folder = '' } = options;
      
      // Validaciones
      this.validateFileType(file, type);
      this.validateFileSize(file, maxSize);

      // Crear un nombre único para el archivo
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedName}`;
      
      // Asegurar que la ruta del archivo incluya el ID del usuario
      const filePath = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;

      // Usar el cliente apropiado según el contexto
      const client = this.isServerSide ? supabaseAdmin : supabaseClient;

      // Subir el archivo
      const { data, error } = await client.storage
        .from(this.bucketName)
        .upload(filePath, file);

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = client.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath
      };
    } catch (error: any) {
      console.error('Error uploading file:', {
        error,
        message: error.message,
        supabaseError: error.error,
        statusCode: error.statusCode,
        isServerSide: this.isServerSide
      });
      
      // Propagar el mensaje de error específico
      if (error.message) {
        throw new Error(`Upload failed: ${error.message}`);
      } else {
        throw new Error('Failed to upload file');
      }
    }
  }

  /**
   * Elimina un archivo de Supabase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const client = this.isServerSide ? supabaseAdmin : supabaseClient;
      
      const { error } = await client.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Obtiene una URL temporal firmada para un archivo
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const client = this.isServerSide ? supabaseAdmin : supabaseClient;
      
      const { data, error } = await client.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate access URL');
    }
  }
}
