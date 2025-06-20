/**
 * Tests for the Job Description service
 */
import { withTestUser, withAnonUser } from '../supabase/test-utils';
import { resetTestDatabase } from '../supabase/test-reset';

describe('Job Description Service', () => {
  // Reset the database before all tests
  beforeAll(async () => {
    await resetTestDatabase();
  });
  
  describe('Job Description CRUD operations', () => {
    it('should allow users to create job descriptions', async () => {
      await withTestUser('basic', async (supabase) => {
        const jobData = {
          title: 'Software Engineer',
          company: 'Test Company',
          content: 'This is a test job description.'
        };
        
        const { data, error } = await supabase.from('job_descriptions').insert(jobData).select();
        
        expect(error).toBeNull();
        expect(data).not.toBeNull();
        expect(data!.length).toBe(1);
        expect(data![0].title).toBe(jobData.title);
      });
    });
    
    it('should allow users to read their own job descriptions', async () => {
      await withTestUser('basic', async (supabase) => {
        // First create a job description
        const jobData = {
          title: 'Data Scientist',
          company: 'Research Lab',
          content: 'This is a job for data analysis.'
        };
        
        const { data: insertData } = await supabase.from('job_descriptions').insert(jobData).select();
        const jobId = insertData![0].id;
        
        // Now try to read it back
        const { data, error } = await supabase.from('job_descriptions').select().eq('id', jobId);
        
        expect(error).toBeNull();
        expect(data).not.toBeNull();
        expect(data!.length).toBe(1);
        expect(data![0].id).toBe(jobId);
      });
    });
    
    it('should allow users to update their own job descriptions', async () => {
      await withTestUser('basic', async (supabase) => {
        // First create a job description
        const jobData = {
          title: 'Product Manager',
          company: 'Tech Company',
          content: 'This is a PM job.'
        };
        
        const { data: insertData } = await supabase.from('job_descriptions').insert(jobData).select();
        const jobId = insertData![0].id;
        
        // Now update it
        const updatedTitle = 'Senior Product Manager';
        const { data, error } = await supabase
          .from('job_descriptions')
          .update({ title: updatedTitle })
          .eq('id', jobId)
          .select();
        
        expect(error).toBeNull();
        expect(data).not.toBeNull();
        expect(data!.length).toBe(1);
        expect(data![0].title).toBe(updatedTitle);
      });
    });
    
    it('should allow users to delete their own job descriptions', async () => {
      await withTestUser('basic', async (supabase) => {
        // First create a job description
        const jobData = {
          title: 'UX Designer',
          company: 'Design Agency',
          content: 'This is a design job.'
        };
        
        const { data: insertData } = await supabase.from('job_descriptions').insert(jobData).select();
        const jobId = insertData![0].id;
        
        // Now delete it
        const { error } = await supabase
          .from('job_descriptions')
          .delete()
          .eq('id', jobId);
        
        expect(error).toBeNull();
        
        // Verify it's gone
        const { data, error: readError } = await supabase
          .from('job_descriptions')
          .select()
          .eq('id', jobId);
        
        expect(readError).toBeNull();
        expect(data!.length).toBe(0);
      });
    });
  });
  
  describe('Job Description access control', () => {
    it('should not allow anonymous users to access job descriptions', async () => {
      await withAnonUser(async (supabase) => {
        const { data, error } = await supabase.from('job_descriptions').select();
        
        expect(error).not.toBeNull();
        expect(data).toBeNull();
      });
    });
    
    it('should not allow users to access job descriptions owned by others', async () => {
      // Create a job description as user 1
      let jobId: string;
      
      await withTestUser('premium', async (supabase) => {
        const jobData = {
          title: 'Private Job',
          company: 'Private Company',
          content: 'This is a private job description.'
        };
        
        const { data } = await supabase.from('job_descriptions').insert(jobData).select();
        jobId = data![0].id;
      });
      
      // Try to access it as user 2
      await withTestUser('basic', async (supabase) => {
        const { data, error } = await supabase
          .from('job_descriptions')
          .select()
          .eq('id', jobId);
        
        // The query succeeds but should return no rows
        expect(error).toBeNull();
        expect(data!.length).toBe(0);
      });
    });
  });
  
  describe('Job Description analysis', () => {
    it('should allow creating job analysis for owned job descriptions', async () => {
      await withTestUser('premium', async (supabase) => {
        // First create a job description
        const jobData = {
          title: 'ML Engineer',
          company: 'AI Corp',
          content: 'This is a machine learning job.'
        };
        
        const { data: jobData1 } = await supabase.from('job_descriptions').insert(jobData).select();
        const jobId = jobData1![0].id;
        
        // Now create an analysis
        const analysisData = {
          job_description_id: jobId,
          requirements: [
            { skill: 'Python', importance: 'high' },
            { skill: 'Machine Learning', importance: 'high' }
          ],
          keywords: [
            { keyword: 'Python', score: 0.9 },
            { keyword: 'Machine Learning', score: 0.85 }
          ],
          experience_level: 'mid-senior',
          company_culture: ['innovative', 'collaborative']
        };
        
        const { data, error } = await supabase.from('job_analysis').insert(analysisData).select();
        
        expect(error).toBeNull();
        expect(data).not.toBeNull();
        expect(data!.length).toBe(1);
        expect(data![0].job_description_id).toBe(jobId);
      });
    });
  });
});
