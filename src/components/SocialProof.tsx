import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react'

const tweets = [
  {
    id: 1,
    author: {
      name: 'Sarah Chen',
      username: 'sarahdesigns',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=40&h=40&fit=crop&crop=face',
      verified: true
    },
    content: 'Just tried Veo3 and I\'m blown away! Created a stunning product demo video in under 2 minutes. This is the future of content creation 🤯',
    timestamp: '2h',
    likes: 234,
    retweets: 45,
    replies: 12
  },
  {
    id: 2,
    author: {
      name: 'Marcus Rodriguez',
      username: 'marcustech',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      verified: false
    },
    content: 'The AI video generation quality on Veo3 is incredible. Used it for my startup\'s marketing campaign and the results exceeded all expectations. Highly recommend! 🚀',
    timestamp: '4h',
    likes: 189,
    retweets: 67,
    replies: 23
  },
  {
    id: 3,
    author: {
      name: 'Emma Thompson',
      username: 'emmafilms',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      verified: true
    },
    content: 'As a filmmaker, I was skeptical about AI video tools. Veo3 changed my mind completely. The quality and creative possibilities are endless. Game changer! 🎬✨',
    timestamp: '6h',
    likes: 456,
    retweets: 123,
    replies: 89
  }
]

export function SocialProof() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Loved by creators worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of content creators, marketers, and filmmakers who are already using Veo3
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tweets.map((tweet) => (
            <Card key={tweet.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                {/* Tweet Header */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
                    <AvatarFallback>{tweet.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{tweet.author.name}</h4>
                      {tweet.author.verified && (
                        <Badge variant="secondary" className="h-4 w-4 p-0 bg-accent text-white">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">@{tweet.author.username}</p>
                  </div>
                  <span className="text-muted-foreground text-sm">{tweet.timestamp}</span>
                </div>

                {/* Tweet Content */}
                <p className="text-foreground mb-4 leading-relaxed">{tweet.content}</p>

                {/* Tweet Actions */}
                <div className="flex items-center justify-between text-muted-foreground">
                  <button className="flex items-center gap-2 hover:text-accent transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{tweet.replies}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                    <Repeat2 className="h-4 w-4" />
                    <span className="text-sm">{tweet.retweets}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{tweet.likes}</span>
                  </button>
                  <button className="hover:text-accent transition-colors">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-8">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['TechCorp', 'CreativeStudio', 'MediaFlow', 'DigitalArts', 'VideoLab'].map((company) => (
              <div key={company} className="text-2xl font-bold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}