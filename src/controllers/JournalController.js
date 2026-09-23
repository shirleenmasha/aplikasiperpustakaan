import JournalModel from '../models/JournalModel';

async function list() {
  return JournalModel.getAll();
}

export default { list };
