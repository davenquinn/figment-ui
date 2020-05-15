import {Component} from 'react';
import {AppStateContext} from '../state-manager';
import {hyperStyled} from '@macrostrat/hyper';
import styles from './styles.styl';

const h = hyperStyled(styles);

const sharedStart = function(array) {
  // From
  // http://stackoverflow.com/questions/1916218/
  //       find-the-longest-common-starting-substring-in-a-set-of-strings
  const A = array.concat().sort();
  const a1 = A[0];
  const a2 = A[A.length - 1];
  const L = a1.length;
  let i = 0;
  while ((i < L) && (a1.charAt(i) === a2.charAt(i))) {
    i++;
  }
  return a1.substring(0, i);
};

class TaskListItem extends Component {
  constructor(...args) {
    super(...args);
    this.onClick = this.onClick.bind(this);
  }

  static initClass() {
    this.contextType = AppStateContext;
  }
  onClick() {
    const {task} = this.props;
    return this.context.selectTask(task);
  }
  render() {
    const {task, displayName} = this.props;
    return h('li', null, (
      h('a', {
        href: `#${task.hash}`,
        onClick: this.onClick
      }, displayName)
    )
    );
  }
}
TaskListItem.initClass();

const TaskListSection = function(props){
  let {tasks, name} = props;

  if (name == null) { name = "Tasks"; }
  // Render spec list from runner
  // Find shared starting substring
  const arr = tasks.map(d => d.outfile);
  arr.push(name);

  const prefix = sharedStart(arr);

  return h('div.task-list', [
    h('h2', [
      h('span.prefix', prefix),
      h('span.name', name.slice(prefix.length))
    ]),
    h('ul', tasks.map(function(task){
      const displayName = task.outfile.slice(prefix.length);
      return h(TaskListItem, {displayName, task});}))
  ]);
};


const TaskList = ({runners}) => h('div', runners.map(d => h(TaskListSection, d))
);

export {TaskList, TaskListItem};
