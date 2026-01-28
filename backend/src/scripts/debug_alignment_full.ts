
import { PortfolioAlignmentService } from '../services/portfolioAlignment.service';
import { ProfileModel } from '../models/profile.model';
import { SurveyModel } from '../models/survey.model';
import db from '../config/database';

async function test() {
    try {
        console.log('Fetching user...');
        const userRes = await db.query(`SELECT id FROM users WHERE email = 'demo-user-001@wealthmax.app'`);
        if (userRes.rows.length === 0) {
            console.log('User not found');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        console.log('Fetching Profile...');
        const profile = await ProfileModel.findByUserId(userId);
        console.log('Profile found:', !!profile);

        console.log('Fetching Survey...');
        const surveyData = await SurveyModel.findByUserId(userId);
        console.log('Survey entries:', surveyData.length);

        const personaData = (profile?.persona_data as any);
        const persona = personaData?.persona?.name || 'General';
        const riskClass = surveyData?.[0]?.final_class || profile?.risk_class || undefined;

        console.log('Persona:', persona);
        console.log('Risk Class:', riskClass);

        console.log('Testing analyzeAlignment...');
        const result = await PortfolioAlignmentService.analyzeAlignment(userId, persona, riskClass);
        console.log('Alignment Score:', result.alignmentScore);

        console.log('Done.');
    } catch (error) {
        console.error('CRASHED:', error);
    } finally {
        process.exit(0);
    }
}

test();
