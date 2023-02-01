import { apiService } from '../../services/ApiService';
import Store from '../Store';

export default class UserStore extends Store {
  constructor(props) {
    super(props);

    this.username = null;
    this.role = null;

    this.errors = {
      login: '',
    };

    this.errorMessage = {
      login: '아이디 혹은 비밀번호가 맞지 않습니다',
    };
  }

  async login({ username, password }) {
    try {
      const { accessToken } = await apiService.postSession({ username, password });

      return accessToken;
    } catch (error) {
      this.errors.login = this.errorMessage.login;

      return '';
    } finally {
      this.publish();
    }
  }

  async fetchUserInformation() {
    try {
      const { username, role } = await apiService.fetchUserInformation();

      this.username = username;
      this.role = role;
    } catch (error) {
      localStorage.removeItem('accessToken');
    }
  }

  clear() {
    this.username = null;
    this.role = null;

    this.errors = {
      login: '',
    };

    this.publish();
  }
}

export const userStore = new UserStore();