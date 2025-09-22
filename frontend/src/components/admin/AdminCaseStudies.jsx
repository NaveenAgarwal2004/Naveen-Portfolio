import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Target, 
  Lightbulb, 
  Trophy, 
  Save, 
  Edit3,
  Eye,
  Plus,
  Loader2,
  Star,
  ExternalLink,
  Github
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import OptimizedImage, { ImagePresets } from '../ui/OptimizedImage';

const AdminCaseStudies = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject({
      ...project,
      problem: project.problem || '',
      solution: project.solution || '',
      outcome: project.outcome || '',
      detailedDescription: project.detailedDescription || ''
    });
  };

  const handleSave = async () => {
    if (!editingProject) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          problem: editingProject.problem,
          solution: editingProject.solution,
          outcome: editingProject.outcome,
          detailedDescription: editingProject.detailedDescription
        })
      });

      if (!response.ok) throw new Error('Failed to update project');

      const data = await response.json();
      
      // Update projects list
      setProjects(prev => prev.map(p => 
        p._id === editingProject._id ? data.data : p
      ));

      setEditingProject(null);
      
      toast({
        title: "Success",
        description: "Case study updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case study",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
  };

  const handleInputChange = (field, value) => {
    setEditingProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="h-6 w-6" />
          Case Studies Management
        </h1>
        <p className="text-gray-400">
          Manage detailed case studies for your projects
        </p>
      </div>

      {/* Projects List */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project._id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <OptimizedImage
                    src={project.image}
                    alt={project.title}
                    {...ImagePresets.thumbnail}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      {project.title}
                      {project.featured && <Star className="h-4 w-4 text-yellow-400" />}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">{project.category}</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                        >
                          <Github className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(project.liveUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(project)}
                  disabled={editingProject?._id === project._id}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {editingProject?._id === project._id ? 'Editing...' : 'Edit Case Study'}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {editingProject?._id === project._id ? (
                // Edit Mode
                <div className="space-y-6">
                  <div className="text-sm text-gray-400 mb-4">
                    Editing case study details for {project.title}
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <Label htmlFor="detailedDescription">Detailed Description</Label>
                    <Textarea
                      id="detailedDescription"
                      value={editingProject.detailedDescription}
                      onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                      placeholder="Comprehensive project description with technical details..."
                      rows={4}
                    />
                  </div>

                  {/* Problem Statement */}
                  <div className="space-y-2">
                    <Label htmlFor="problem" className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-400" />
                      Problem Statement
                    </Label>
                    <Textarea
                      id="problem"
                      value={editingProject.problem}
                      onChange={(e) => handleInputChange('problem', e.target.value)}
                      placeholder="What problem does this project solve? What challenges did you identify?"
                      rows={4}
                      className="border-red-500/20 focus:border-red-400"
                    />
                  </div>

                  {/* Solution */}
                  <div className="space-y-2">
                    <Label htmlFor="solution" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                      Solution Implemented
                    </Label>
                    <Textarea
                      id="solution"
                      value={editingProject.solution}
                      onChange={(e) => handleInputChange('solution', e.target.value)}
                      placeholder="How did you solve the problem? What approach and technologies did you use?"
                      rows={4}
                      className="border-blue-500/20 focus:border-blue-400"
                    />
                  </div>

                  {/* Outcome */}
                  <div className="space-y-2">
                    <Label htmlFor="outcome" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-green-400" />
                      Outcome & Results
                    </Label>
                    <Textarea
                      id="outcome"
                      value={editingProject.outcome}
                      onChange={(e) => handleInputChange('outcome', e.target.value)}
                      placeholder="What were the results? How did you measure success? What impact did it have?"
                      rows={4}
                      className="border-green-500/20 focus:border-green-400"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <p className="text-gray-300">{project.description}</p>

                  {/* Case Study Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-medium text-red-300">Problem</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {project.problem ? (
                          project.problem.length > 100 
                            ? `${project.problem.substring(0, 100)}...` 
                            : project.problem
                        ) : (
                          <span className="text-gray-500 italic">Not defined</span>
                        )}
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Solution</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {project.solution ? (
                          project.solution.length > 100 
                            ? `${project.solution.substring(0, 100)}...` 
                            : project.solution
                        ) : (
                          <span className="text-gray-500 italic">Not defined</span>
                        )}
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Outcome</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {project.outcome ? (
                          project.outcome.length > 100 
                            ? `${project.outcome.substring(0, 100)}...` 
                            : project.outcome
                        ) : (
                          <span className="text-gray-500 italic">Not defined</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Projects Found</h3>
            <p className="text-gray-400 mb-4">Create some projects first to manage their case studies.</p>
            <Button
              onClick={() => window.location.href = '/admin/projects/new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCaseStudies;