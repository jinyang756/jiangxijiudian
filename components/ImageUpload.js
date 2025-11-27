class ImageUpload extends HTMLElement {
  constructor() {
    super();
    this.uploading = false;
    this.file = null;
    this.dishId = '';
    this.onUploadComplete = null;
  }

  connectedCallback() {
    this.dishId = this.getAttribute('dish-id') || '';
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="flex items-center space-x-2">
        <input
          type="file"
          accept="image/*"
          class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          上传图片
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    const fileInput = this.querySelector('input[type="file"]');
    const uploadButton = this.querySelector('button');
    
    fileInput.addEventListener('change', (e) => {
      const target = e.target;
      if (target.files && target.files.length > 0) {
        this.file = target.files[0];
      }
    });
    
    uploadButton.addEventListener('click', () => {
      this.handleUpload();
    });
  }

  async handleUpload() {
    if (!this.file) return;

    try {
      this.uploading = true;
      this.updateButtonState();
      
      // 获取Supabase客户端
      const supabase = window.supabase;
      
      // 上传到 Supabase Storage
      const fileExt = this.file.name.split('.').pop();
      const fileName = `dishes/${this.dishId}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('dish-images')
        .upload(fileName, this.file, {
          upsert: true
        });

      if (error) {
        throw error;
      }

      // 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('dish-images')
        .getPublicUrl(fileName);

      // 调用回调函数，传递图片URL
      if (this.onUploadComplete) {
        this.onUploadComplete(publicUrl);
      }
      
      // 清空文件选择
      this.file = null;
      const fileInput = this.querySelector('input[type="file"]');
      fileInput.value = '';
    } catch (error) {
      console.error('上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      this.uploading = false;
      this.updateButtonState();
    }
  }

  updateButtonState() {
    const uploadButton = this.querySelector('button');
    if (this.uploading) {
      uploadButton.textContent = '上传中...';
      uploadButton.disabled = true;
    } else {
      uploadButton.textContent = '上传图片';
      uploadButton.disabled = !this.file;
    }
  }
}

customElements.define('image-upload', ImageUpload);

export default ImageUpload;