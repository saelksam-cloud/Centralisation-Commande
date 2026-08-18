import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Subcontractor, TRADE_LABELS } from '@/lib/planning-types'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 })
  }

  const { devisText, subcontractors, projectName } = await req.json() as {
    devisText: string
    subcontractors: Subcontractor[]
    projectName: string
  }

  const client = new Anthropic({ apiKey })

  const subsDescription = subcontractors.length > 0
    ? subcontractors.map(s => `- ${TRADE_LABELS[s.category]}: ${s.name}${s.phone ? ` (${s.phone})` : ''}`).join('\n')
    : 'Aucun sous-traitant renseigné'

  const prompt = `Tu es un expert en planification de chantier BTP.
Analyse ce devis de chantier et génère un planning prévisionnel des grandes lignes.

PROJET: ${projectName}

SOUS-TRAITANTS DISPONIBLES:
${subsDescription}

DEVIS:
${devisText.slice(0, 12000)}

Génère un planning en JSON avec le format suivant. Estime les durées en semaines de façon réaliste selon la nature et le volume des travaux. Respecte l'ordre logique des corps de métier (gros œuvre avant second œuvre, etc.).

Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après:
{
  "lots": [
    {
      "id": "lot-1",
      "name": "Nom du lot",
      "category": "une des catégories: gros_oeuvre|charpente|couverture|facade|isolation|electricite|plomberie|chauffage|menuiserie_ext|menuiserie_int|platrerie|carrelage|peinture|espaces_verts|vrd|autre",
      "startWeek": 0,
      "durationWeeks": 4,
      "description": "Description courte des travaux",
      "subcontractorId": "id du sous-traitant si trouvé dans la liste, sinon null"
    }
  ],
  "totalWeeks": 20,
  "summary": "Résumé du projet en 2-3 phrases"
}

Règles:
- startWeek commence à 0
- Les lots peuvent se chevaucher si logique
- Assigne les sous-traitants de la liste si leur catégorie correspond
- Sois réaliste sur les durées (une maison individuelle = 12-18 mois, une rénovation légère = 4-8 semaines)`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Réponse invalide du modèle' }, { status: 500 })
    }

    const planning = JSON.parse(jsonMatch[0])
    return NextResponse.json(planning)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la génération du planning' }, { status: 500 })
  }
}
