'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    const data = await this.model('apperror').select();
    this.assign('data',data);

    return this.display();
  }
}