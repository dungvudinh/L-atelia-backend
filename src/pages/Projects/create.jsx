import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectEditor from '../../components/projects/ProjectEditor';
import ProjectHeader from '../../components/projects/ProjectHeader';
import initialPr

const CreateProject = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(initialProjectState);
  const [saving, setSaving] = useState(false);

  const handleSave = async (projectData) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectHeader 
        title="Tạo Dự án Mới"
        subtitle="Thêm thông tin chi tiết cho dự án mới"
        saving={saving}
        onSave={() => handleSave(project)}
        onCancel="/admin/projects"
      />
      
      <div className="bg-white rounded-lg border border-gray-200">
        <ProjectEditor
          project={project}
          onChange={setProject}
          mode="create"
        />
      </div>
    </div>
  );
};

export default CreateProject;