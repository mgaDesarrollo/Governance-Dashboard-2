const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestConsensusReports() {
  try {
    console.log('Creating test consensus reports...');

    // Crear un usuario de prueba
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'SUPER_ADMIN'
      }
    });

    // Crear un workgroup de prueba
    const testWorkGroup = await prisma.workGroup.upsert({
      where: { name: 'Test WorkGroup' },
      update: {},
      create: {
        name: 'Test WorkGroup',
        description: 'A test workgroup for consensus testing',
        mission: 'Testing consensus functionality',
        scope: 'Development and testing',
        createdBy: { connect: { id: testUser.id } }
      }
    });

    // Crear reportes trimestrales con diferentes estados de consenso
    const reports = [
      {
        workGroupId: testWorkGroup.id,
        year: 2025,
        quarter: 'Q1',
        detail: 'Reporte trimestral de prueba para consenso - Pendiente',
        theoryOfChange: 'Implementar sistema de consenso para gobernanza',
        plans: 'Desarrollar funcionalidades avanzadas de votación',
        consensusStatus: 'PENDING',
        createdById: testUser.id,
        challenges: [{ text: 'Integración con sistemas existentes', completed: false }]
      },
      {
        workGroupId: testWorkGroup.id,
        year: 2025,
        quarter: 'Q2',
        detail: 'Reporte trimestral de prueba para consenso - En Consenso',
        theoryOfChange: 'Mejorar la participación comunitaria',
        plans: 'Expandir el sistema de votación',
        consensusStatus: 'IN_CONSENSUS',
        createdById: testUser.id,
        challenges: [{ text: 'Escalabilidad del sistema', completed: true }]
      },
      {
        workGroupId: testWorkGroup.id,
        year: 2024,
        quarter: 'Q4',
        detail: 'Reporte trimestral de prueba para consenso - Consensuado',
        theoryOfChange: 'Establecer estándares de gobernanza',
        plans: 'Implementar métricas de seguimiento',
        consensusStatus: 'CONSENSED',
        createdById: testUser.id,
        challenges: [{ text: 'Definir métricas clave', completed: true }]
      }
    ];

    for (const reportData of reports) {
      const report = await prisma.quarterlyReport.create({
        data: {
          ...reportData,
          participants: {
            create: {
              userId: testUser.id
            }
          },
          budgetItems: {
            create: [
              {
                name: 'Desarrollo de Software',
                description: 'Costos de desarrollo del sistema',
                amountUsd: 25000
              },
              {
                name: 'Infraestructura',
                description: 'Servidores y servicios en la nube',
                amountUsd: 15000
              }
            ]
          },
          votingRounds: {
            create: {
              roundNumber: 1,
              status: 'ACTIVA',
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
            }
          }
        }
      });

      console.log(`Created report: ${report.id} - ${report.consensusStatus}`);
    }

    console.log('Test consensus reports created successfully!');
  } catch (error) {
    console.error('Error creating test reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestConsensusReports(); 