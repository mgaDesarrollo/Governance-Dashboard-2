"use client"

import React from 'react'
import { Timeline, TimelineItem, TimelinePoint, TimelineContent, TimelineTime, TimelineTitle, TimelineBody } from 'flowbite-react'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, TargetIcon, VoteIcon, CheckCircleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProposalTimelineProps {
  createdAt: string
  expiresAt: string
  status: string
  consensusDate?: string | null
  updatedAt?: string | null
}

const ProposalTimeline: React.FC<ProposalTimelineProps> = ({
  createdAt,
  expiresAt,
  status,
  consensusDate,
  updatedAt
}) => {
  const now = new Date()

  const getEventStatus = (eventDate: string): 'completed' | 'upcoming' => {
    const eventDateObj = new Date(eventDate)
    return eventDateObj < now ? 'completed' : 'upcoming'
  }

  return (
    <div className="border-l-4 border-blue-600 rounded-sm overflow-hidden shadow-lg mb-6">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Timeline</h3>
            <p className="text-sm text-slate-400">Progreso de la propuesta</p>
          </div>
        </div>

        <Timeline className="border-l-2 border-slate-600">
          <TimelineItem>
            <div className="flex items-center mb-4">
              <div className="bg-green-600 p-1.5 rounded-full">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="absolute -left-1.5 mt-1.5">
              <div className="h-3 w-3 rounded-full border-2 border-slate-700"></div>
            </div>
            <TimelineContent className="ml-4">
              <TimelineTime className="text-slate-400 text-sm">
                {format(new Date(createdAt), 'MMM dd, yyyy · h:mm a', { locale: es })}
              </TimelineTime>
              <TimelineTitle className="text-slate-200 text-base font-semibold">
                Propuesta Creada
              </TimelineTitle>
              <TimelineBody className="text-slate-400 text-sm mb-2">
                La propuesta fue creada y enviada para revisión.
              </TimelineBody>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                Completado
              </Badge>
            </TimelineContent>
          </TimelineItem>

          {updatedAt && (
            <TimelineItem>
              <div className="flex items-center mb-4">
                <div className="bg-yellow-600 p-1.5 rounded-full">
                  <TargetIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="absolute -left-1.5 mt-1.5">
                <div className="h-3 w-3 rounded-full border-2 border-slate-700"></div>
              </div>
              <TimelineContent className="ml-4">
                <TimelineTime className="text-slate-400 text-sm">
                  {format(new Date(updatedAt), 'MMM dd, yyyy · h:mm a', { locale: es })}
                </TimelineTime>
                <TimelineTitle className="text-slate-200 text-base font-semibold">
                  Propuesta Actualizada
                </TimelineTitle>
                <TimelineBody className="text-slate-400 text-sm mb-2">
                  La propuesta fue modificada por el autor.
                </TimelineBody>
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Editado
                </Badge>
              </TimelineContent>
            </TimelineItem>
          )}

          <TimelineItem>
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 p-1.5 rounded-full">
                <VoteIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="absolute -left-1.5 mt-1.5">
              <div className="h-3 w-3 rounded-full border-2 border-slate-700"></div>
            </div>
            <TimelineContent className="ml-4">
              <TimelineTime className="text-slate-400 text-sm">
                {format(new Date(expiresAt), 'MMM dd, yyyy · h:mm a', { locale: es })}
              </TimelineTime>
              <TimelineTitle className="text-slate-200 text-base font-semibold">
                Período de Votación
              </TimelineTitle>
              <TimelineBody className="text-slate-400 text-sm mb-2">
                Período para que la comunidad vote la propuesta.
              </TimelineBody>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {getEventStatus(expiresAt) === 'completed' ? 'Completado' : 'Activo'}
              </Badge>
            </TimelineContent>
          </TimelineItem>

          {consensusDate && (
            <TimelineItem>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-1.5 rounded-full">
                  <CheckCircleIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="absolute -left-1.5 mt-1.5">
                <div className="h-3 w-3 rounded-full border-2 border-slate-700"></div>
              </div>
              <TimelineContent className="ml-4">
                <TimelineTime className="text-slate-400 text-sm">
                  {format(new Date(consensusDate), 'MMM dd, yyyy · h:mm a', { locale: es })}
                </TimelineTime>
                <TimelineTitle className="text-slate-200 text-base font-semibold">
                  Consenso Alcanzado
                </TimelineTitle>
                <TimelineBody className="text-slate-400 text-sm mb-2">
                  La propuesta alcanzó consenso de la comunidad.
                </TimelineBody>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Consenso
                </Badge>
              </TimelineContent>
            </TimelineItem>
          )}
        </Timeline>
      </div>
    </div>
  )
};

export default ProposalTimeline;