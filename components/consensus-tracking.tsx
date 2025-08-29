"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  HandIcon,
  MessageSquareIcon,
  ReplyIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  UserIcon
} from 'lucide-react'
import type { Proposal, ProposalStatusType, VoteTypeEnum } from '@/lib/types'

interface ConsensusTrackingProps {
  proposal: Proposal
  onVote: (voteType: VoteTypeEnum, comment?: string) => Promise<void>
  onComment: (content: string, parentId?: string) => Promise<void>
  onReply: (content: string, commentId: string) => Promise<void>
  isSubmittingVote: boolean
  isSubmittingComment: boolean
  canVote: boolean
}

interface VoteData {
  type: VoteTypeEnum
  user: { name: string; image?: string }
  comment?: string
  timestamp: string
  replies?: CommentData[]
}

interface CommentData {
  id: string
  user: { name: string; image?: string }
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies?: CommentData[]
}

export default function ConsensusTracking({
  proposal,
  onVote,
  onComment,
  onReply,
  isSubmittingVote,
  isSubmittingComment,
  canVote
}: ConsensusTrackingProps) {
  const [activeTab, setActiveTab] = useState('voting')
  const [voteType, setVoteType] = useState<VoteTypeEnum | null>(null)
  const [voteComment, setVoteComment] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [commentLikes, setCommentLikes] = useState<Record<string, { likes: number; dislikes: number; userLike?: 'like' | 'dislike' | null }>>({})

  const handleVote = async () => {
    if (!voteType) return

    // Validaciones según el tipo de voto
    if (voteType === 'NEGATIVE' && !voteComment.trim()) {
      alert('El voto negativo requiere un comentario explicando el motivo.')
      return
    }
    if (voteType === 'ABSTAIN' && !voteComment.trim()) {
      alert('La abstención requiere un comentario explicando el motivo.')
      return
    }

    await onVote(voteType, voteComment.trim() || undefined)
    setVoteType(null)
    setVoteComment('')
  }

  const handleComment = async () => {
    if (!commentContent.trim()) return
    await onComment(commentContent)
    setCommentContent('')
  }

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return
    await onReply(replyContent, commentId)
    setReplyingTo(null)
    setReplyContent('')
  }

  const handleCommentLike = (commentId: string, type: 'like' | 'dislike') => {
    setCommentLikes(prev => {
      const current = prev[commentId] || { likes: 0, dislikes: 0 }
      const userLike = current.userLike
      
      let newLikes = current.likes
      let newDislikes = current.dislikes
      let newUserLike: 'like' | 'dislike' | null = type

      if (userLike === type) {
        // Si ya está votado, quitar el voto
        if (type === 'like') newLikes--
        else newDislikes--
        newUserLike = null
      } else if (userLike === null) {
        // Si no hay voto, agregar el nuevo
        if (type === 'like') newLikes++
        else newDislikes++
      } else {
        // Si hay voto diferente, cambiar
        if (type === 'like') {
          newLikes++
          newDislikes--
        } else {
          newDislikes++
          newLikes--
        }
      }

      return {
        ...prev,
        [commentId]: {
          likes: newLikes,
          dislikes: newDislikes,
          userLike: newUserLike
        }
      }
    })
  }

  // Inicializar likes para comentarios existentes
  React.useEffect(() => {
    if (proposal.comments) {
      const initialLikes: Record<string, { likes: number; dislikes: number; userLike?: 'like' | 'dislike' | null }> = {}
      proposal.comments.forEach(comment => {
        initialLikes[comment.id] = { likes: 0, dislikes: 0 }
      })
      setCommentLikes(initialLikes)
    }
  }, [proposal.comments])

  const getVoteIcon = (type: VoteTypeEnum) => {
    switch (type) {
      case 'POSITIVE':
        return <ThumbsUpIcon className="h-5 w-5 text-green-300" />
      case 'NEGATIVE':
        return <ThumbsDownIcon className="h-5 w-5 text-red-300" />
      case 'ABSTAIN':
        return <HandIcon className="h-5 w-5 text-yellow-300" />
    }
  }

  const getVoteColor = (type: VoteTypeEnum) => {
    switch (type) {
      case 'POSITIVE':
        return 'bg-green-500/30 text-green-200 border-green-400/50 font-medium'
      case 'NEGATIVE':
        return 'bg-red-500/30 text-red-200 border-red-400/50 font-medium'
      case 'ABSTAIN':
        return 'bg-yellow-500/30 text-yellow-200 border-yellow-400/50 font-medium'
    }
  }

  const getVoteText = (type: VoteTypeEnum) => {
    switch (type) {
      case 'POSITIVE':
        return 'A Favor'
      case 'NEGATIVE':
        return 'En Contra'
      case 'ABSTAIN':
        return 'Abstención'
    }
  }

  return (
    <div className="border-l-4 border-purple-600 rounded-sm overflow-hidden shadow-lg mb-6">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M14 8.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
              <path d="M8 11.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
              <path d="M20 11.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Consensus Tracking</h3>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-slate-700 mb-4">
            <TabsTrigger value="voting" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none">
              Voting
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none">
              Comments & Replies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="mt-4">
            {canVote ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Button
                    variant={voteType === "POSITIVE" ? "default" : "outline"}
                    className={`${
                      voteType === "POSITIVE"
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                        : "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-300 hover:text-green-200"
                    } transition-all duration-200 font-medium`}
                    onClick={() => setVoteType("POSITIVE")}
                    disabled={isSubmittingVote}
                  >
                    {voteType === "POSITIVE" && <CheckIcon className="mr-1 h-4 w-4" />}
                    <ThumbsUpIcon className="h-4 w-4" />
                    <span className="ml-1">For</span>
                  </Button>
                  <Button
                    variant={voteType === "NEGATIVE" ? "default" : "outline"}
                    className={`${
                      voteType === "NEGATIVE"
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                        : "bg-red-500/20 border-red-500/40 hover:bg-red-500/30 text-red-300 hover:text-red-200"
                    } transition-all duration-200 font-medium`}
                    onClick={() => setVoteType("NEGATIVE")}
                    disabled={isSubmittingVote}
                  >
                    {voteType === "NEGATIVE" && <CheckIcon className="mr-1 h-4 w-4" />}
                    <ThumbsDownIcon className="h-4 w-4" />
                    <span className="ml-1">Against</span>
                  </Button>
                  <Button
                    variant={voteType === "ABSTAIN" ? "default" : "outline"}
                    className={`${
                      voteType === "ABSTAIN"
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/25"
                        : "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30 text-yellow-300 hover:text-yellow-200"
                    } transition-all duration-200 font-medium`}
                    onClick={() => setVoteType("ABSTAIN")}
                    disabled={isSubmittingVote}
                  >
                    {voteType === "ABSTAIN" && <CheckIcon className="mr-1 h-4 w-4" />}
                    <HandIcon className="h-4 w-4" />
                    <span className="ml-1">Abstain</span>
                  </Button>
                </div>

                {voteType && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getVoteIcon(voteType)}
                      <Badge variant="outline" className={getVoteColor(voteType)}>
                        {getVoteText(voteType)}
                      </Badge>
                      {(voteType === 'NEGATIVE' || voteType === 'ABSTAIN') && (
                        <Badge variant="outline" className="bg-orange-500/30 text-orange-200 border-orange-400/50 font-medium">
                          Comentario Requerido
                        </Badge>
                      )}
                    </div>

                    {(voteType === 'NEGATIVE' || voteType === 'ABSTAIN') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {voteType === 'NEGATIVE' 
                            ? 'Explica por qué estás en contra:' 
                            : 'Explica por qué te abstienes:'}
                        </label>
                        <Textarea
                          value={voteComment}
                          onChange={(e) => setVoteComment(e.target.value)}
                          placeholder={voteType === 'NEGATIVE' 
                            ? 'Explica tu razón para votar en contra...' 
                            : 'Explica tu razón para abstenerte...'}
                          className="min-h-[100px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                          required
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={handleVote}
                        disabled={isSubmittingVote || (voteType !== 'POSITIVE' && !voteComment.trim())}
                        className={`${
                          voteType === 'POSITIVE' 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25' 
                            : voteType === 'NEGATIVE'
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/25'
                        } transition-all duration-200 font-medium`}
                      >
                        {isSubmittingVote ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            Submit {voteType === 'POSITIVE' ? 'Positive' : voteType === 'NEGATIVE' ? 'Negative' : 'Abstain'} Vote
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVoteType(null)
                          setVoteComment('')
                        }}
                        className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200"
                      >
                        <XIcon className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Resumen de votos */}
                <div className="mt-6 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-4 text-center">Vote Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 border-l-4 border-green-500 rounded-md">
                      <div className="text-3xl font-bold text-green-300 mb-1">{proposal.positiveVotes}</div>
                      <div className="text-sm text-green-200 font-medium">For</div>
                    </div>
                    <div className="p-3 border-l-4 border-red-500 rounded-md">
                      <div className="text-3xl font-bold text-red-300 mb-1">{proposal.negativeVotes}</div>
                      <div className="text-sm text-red-200 font-medium">Against</div>
                    </div>
                    <div className="p-3 border-l-4 border-yellow-500 rounded-md">
                      <div className="text-3xl font-bold text-yellow-300 mb-1">{proposal.abstainVotes}</div>
                      <div className="text-sm text-yellow-200 font-medium">Abstain</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-300 border border-slate-600 rounded-md">

                  Voting is currently closed for this proposal.
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {/* Formulario de comentario general */}
              <div className="p-4 rounded-lg border border-slate-600">
                <h4 className="font-semibold text-slate-200 mb-3">Add General Comment</h4>
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add your comment or feedback..."
                  className="min-h-[100px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500 mb-3"
                  disabled={isSubmittingComment}
                />
                <Button
                  onClick={handleComment}
                  disabled={!commentContent.trim() || isSubmittingComment}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageSquareIcon className="mr-2 h-4 w-4" />
                      Submit Comment
                    </>
                  )}
                </Button>
              </div>

              {/* Lista de comentarios */}
              {proposal.comments && proposal.comments.length > 0 ? (
                <div className="space-y-4">
                  {proposal.comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                          {comment.user.image ? (
                            <img
                              src={comment.user.image}
                              alt={comment.user.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <UserIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-200">{comment.user.name}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              commentLikes[comment.id]?.userLike === 'like' 
                                ? 'text-green-400 bg-green-400/20' 
                                : 'text-slate-400 hover:text-green-400'
                            }`}
                            title="Like"
                            onClick={() => handleCommentLike(comment.id, 'like')}
                          >
                            <ThumbsUpIcon className="h-3 w-3" />
                          </Button>
                          <span className={`text-xs ${
                            commentLikes[comment.id]?.userLike === 'like' ? 'text-green-400 font-semibold' : 'text-slate-400'
                          }`}>
                            {commentLikes[comment.id]?.likes || 0}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              commentLikes[comment.id]?.userLike === 'dislike' 
                                ? 'text-red-400 bg-red-400/20' 
                                : 'text-slate-400 hover:text-red-400'
                            }`}
                            title="Dislike"
                            onClick={() => handleCommentLike(comment.id, 'dislike')}
                          >
                            <ThumbsDownIcon className="h-3 w-3" />
                          </Button>
                          <span className={`text-xs ${
                            commentLikes[comment.id]?.userLike === 'dislike' ? 'text-red-400 font-semibold' : 'text-slate-400'
                          }`}>
                            {commentLikes[comment.id]?.dislikes || 0}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(comment.id)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400"
                            title="Reply"
                          >
                            <ReplyIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-slate-300 whitespace-pre-line mb-3">
                        {comment.content}
                      </div>

                      {/* Formulario de respuesta */}
                      {replyingTo === comment.id && (
                        <div className="ml-8 mt-3 p-3 bg-slate-600/50 rounded-lg border border-slate-500">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="min-h-[80px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500 mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <ReplyIcon className="mr-1 h-3 w-3" />
                              Reply
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent('')
                              }}
                              className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Respuestas existentes - Temporalmente comentado hasta implementar en la base de datos */}
                      {/* {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 mt-3 space-y-2">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-slate-600/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-500 flex items-center justify-center">
                                  {reply.user.image ? (
                                    <img
                                      src={reply.user.image}
                                      alt={reply.user.name}
                                      className="h-6 w-6 rounded-full"
                                    />
                                  ) : (
                                    <UserIcon className="h-3 w-3 text-slate-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-200 text-sm">{reply.user.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-slate-400 hover:text-green-400"
                                    title="Like"
                                  >
                                    <ThumbsUpIcon className="h-2.5 w-2.5" />
                                  </Button>
                                  <span className="text-xs text-slate-400">{reply.likes || 0}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-slate-400 hover:text-red-400"
                                    title="Dislike"
                                  >
                                    <ThumbsDownIcon className="h-2.5 w-2.5" />
                                  </Button>
                                  <span className="text-xs text-slate-400">{reply.dislikes || 0}</span>
                                </div>
                              </div>
                              <div className="text-slate-300 text-sm whitespace-pre-line">
                                {reply.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquareIcon className="mx-auto h-12 w-12 text-slate-500 mb-2" />
                  <p className="text-slate-400">No comments yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
