

define(['angularAMD'], function (angularAMD) {
    var module,
      __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
    angularAMD.directive('cireAbnTree', [
       '$timeout', function ($timeout) {
           return {
               restrict: 'E',
               templateUrl: "/Scripts/ng/shared/directives/templates/abnTree.html",
               replace: true,
               scope: {
                   treeData: '=',
                   selectHandler: '&',
                   initialSelection: '@',
                   stateHandler: '&',
                   treeApiControl: '=',
                   iconExpand: '@',
                   iconCollapse: '@'
               },
               link: function (scope, element, attrs) {

                   //default tree values if not specified in element
                   attrs.iconExpand = attrs.iconExpand || scope.iconExpand;
                   attrs.iconCollapse = attrs.iconCollapse || scope.iconCollapse;
                   attrs.iconLeaf = attrs.iconLeaf || '';
                   attrs.expandLevel = attrs.expandLevel || '1';

                   if (!scope.treeData) {
                       return console.warn('no treeData defined for the tree!');
                   };
                   if (scope.treeData.length == null) {
                       if (treeData.label != null) {
                           scope.treeData = [treeData];
                       } else {
                           return console.warn('treeData should be an array of root branches');
                       }
                   };

                   var recurseActionOnEachBranch = function (action) {
                       var recurseTheAction = function (branch, level) {
                           action(branch, level);

                           if (branch.children != null) {
                               var branchChildrenRef = branch.children;
                               var returnData = [];

                               for (var i = 0; i < branchChildrenRef.length; i++) {
                                   var child = branchChildrenRef[i];
                                   returnData.push(recurseTheAction(child, level + 1));
                               }

                               return returnData;
                           }
                       };

                       var treeDataRef = scope.treeData;
                       var returnData = [];

                       for (var i = 0; i < treeDataRef.length; i++) {
                           returnData.push(recurseTheAction(treeDataRef[i], 1));
                       }

                       return returnData;
                   };

                   var selected_branch = null;
                   var select_branch = function (branch) {

                       if (!branch) {
                           if (selected_branch != null) {
                               selected_branch.selected = false;
                           }
                           selected_branch = null;
                           return;
                       };

                       //unselect the current selection
                       if (selected_branch != null) {
                           selected_branch.selected = false;
                       }
                       branch.selected = true;
                       selected_branch = branch;
                       expand_all_parents(branch);

                       //leave branch open if children are there
                       if (branch.children && branch.children.length > 0) {
                           branch.expanded = true;
                       } else {
                           branch.expanded = !branch.expanded;
                       }

                       //branch specific function call
                       if (branch.onSelect != null) {
                           return $timeout(function () {
                               return branch.onSelect(branch);
                           });
                       } else { //user specified select handler for every branch
                           if (scope.selectHandler != null) {
                               return $timeout(function () {
                                   return scope.selectHandler({
                                       branch: branch
                                   });
                               });
                           }
                       }
                   };

                   scope.user_clicks_branch = function (branch, $event) {
                      
                       if ($event.target.className.indexOf('tree-icon') > -1) {
                           branch.expanded = !branch.expanded;
                           return;
                       } else {
                           //this is for mobile class to show and off the content.
                           $('.nav-dropdown').toggleClass('show-nav-content');
                       };
                       return select_branch(branch);
                   };

                   var get_parent = function (child) {
                       var parent = void 0;
                       if (child.parent_uid) {
                           recurseActionOnEachBranch(function (branch) {
                               if (branch.uid === child.parent_uid) {
                                   return parent = branch;
                               }
                           });
                       }
                       return parent;
                   };

                   var for_all_ancestors = function (child, fn) {
                       var parent;
                       parent = get_parent(child);
                       if (parent != null) {
                           fn(parent);
                           return for_all_ancestors(parent, fn);
                       }
                   };

                   var expand_all_parents = function (child) {
                       return for_all_ancestors(child, function (b) {
                           return b.expanded = true;
                       });
                   };

                   scope.tree_rows = [];

                   var onTreeChange = function () {
                       //set branch uid if not set
                       recurseActionOnEachBranch(function (branch, level) {
                           if (!branch.uid) {
                               return branch.uid = "" + Math.random();
                           }
                       });
                       //process branch parent uid if applicable / not set
                       recurseActionOnEachBranch(function (branch) {

                           if (angular.isArray(branch.children)) {
                               var _results = [];
                               var childrenRef = branch.children;

                               for (var i = 0; i < childrenRef.length; i++) {
                                   var child = childrenRef[i];
                                   _results.push(child.parent_uid = branch.uid);
                               }
                               return _results;
                           }
                       });
                       //handle children declares as string arrays or object arrays
                       recurseActionOnEachBranch(function (branch) {
                           if (!branch.children) { return branch.children = []; }

                           if (branch.children.length > 0) {
                               var addChildObjectOrString = function (e) {
                                   if (typeof e === 'string') {
                                       return {
                                           label: e,
                                           children: []
                                       };
                                   } else {
                                       return e;
                                   }
                               };

                               return branch.children = (function () {
                                   var _results = [];
                                   var childrenRef = branch.children;

                                   for (var i = 0; i < childrenRef.length; i++) {
                                       _results.push(addChildObjectOrString(childrenRef[i]));
                                   }
                                   return _results;
                               })();
                           }
                       });

                       scope.tree_rows = [];
                       var addTreeRow = function (level, branch, visible) {
                           //set default values for falsey property vals
                           branch.expanded = branch.expanded || false;
                           branch.classes = branch.classes || [];
                           branch.children = branch.children || [];

                           //set icon based on branch type and state
                           var icon;
                           if (!branch.children || branch.children.length === 0) {
                               icon = attrs.iconLeaf;
                               if (__indexOf.call(branch.classes, "leaf") < 0) {
                                   branch.classes.push("leaf");
                               }
                           } else {
                               if (branch.expanded) {
                                   icon = attrs.iconCollapse;
                               } else {
                                   icon = attrs.iconExpand;
                               }
                           }

                           scope.tree_rows.push({
                               level: level,
                               branch: branch,
                               childCount: branch.children.length,
                               label: branch.label,
                               classes: branch.classes,
                               icon: icon,
                               visible: visible
                           });

                           //add children recursively if applicable
                           if (branch.children.length > 0) {
                               var childrenRef = branch.children;
                               var _results = [];
                               for (var i = 0; i < childrenRef.length; i++) {
                                   var child = childrenRef[i];
                                   var child_visible = visible && branch.expanded;
                                   _results.push(addTreeRow(level + 1, child, child_visible));
                               }

                               return _results;
                           };
                       };

                       var treeDataRef = scope.treeData;
                       var _results = [];
                       for (var i = 0; i < treeDataRef.length; i++) {
                           _results.push(addTreeRow(1, treeDataRef[i], true));
                       }

                       return _results;
                   };

                   scope.$watch('treeData', onTreeChange, true);

                   //initial selection set via html attr
                   if (attrs.initialSelection != null) {
                       recurseActionOnEachBranch(function (branch) {
                           if (branch.label === attrs.initialSelection) {
                               return $timeout(function () {
                                   return select_branch(branch);
                               });
                           }
                       });
                   }

                   //dynamically set selected based on url
                   if (scope.stateHandler != null) {
                       $timeout(function () {
                           recurseActionOnEachBranch(function (branch) {
                               var shouldHandleState = scope.stateHandler({ branch: branch });
                               if (shouldHandleState) {
                                   return select_branch(branch);
                               }
                           });
                       });
                   }

                   //set level of expansion
                   var expand_level = parseInt(attrs.expandLevel, 10);
                   recurseActionOnEachBranch(function (b, level) {
                       b.level = level;
                       return b.expanded = b.level < expand_level;
                   });



                   /* tree control api */
                   var tree;
                   var dataLength = scope.treeData.length;
                   if (scope.treeApiControl != null) {
                       if (angular.isObject(scope.treeApiControl)) {
                           tree = scope.treeApiControl;

                           tree.clear_selected_branch = function () {
                               if (selected_branch != null) {
                                   selected_branch.selected = false;
                               }
                               selected_branch = null;
                           };
                           tree.update_selected_branch = function (branchLabel) {
                               return recurseActionOnEachBranch(function (branch) {
                                   if (branch.label === branchLabel) {
                                       return $timeout(function () {
                                           return select_branch(branch);
                                       });
                                   }
                               });
                           };
                           tree.expand_all = function () {
                               return recurseActionOnEachBranch(function (b, level) {
                                   return b.expanded = true;
                               });
                           };
                           tree.collapse_all = function () {
                               return recurseActionOnEachBranch(function (b, level) {
                                   return b.expanded = false;
                               });
                           };
                           tree.get_first_branch = function () {
                               dataLength = scope.treeData.length;
                               if (dataLength > 0) {
                                   return scope.treeData[0];
                               }
                           };
                           tree.select_first_branch = function () {
                               var b;
                               b = tree.get_first_branch();
                               return tree.select_branch(b);
                           };
                           tree.get_selected_branch = function () {
                               return selected_branch;
                           };
                           tree.get_parent_branch = function (b) {
                               return get_parent(b);
                           };
                           tree.select_branch = function (b) {
                               select_branch(b);
                               return b;
                           };
                           tree.get_children = function (b) {
                               return b.children;
                           };
                           tree.select_parent_branch = function (b) {
                               var p;
                               if (b == null) {
                                   b = tree.get_selected_branch();
                               }
                               if (b != null) {
                                   p = tree.get_parent_branch(b);
                                   if (p != null) {
                                       tree.select_branch(p);
                                       return p;
                                   }
                               }
                           };
                           tree.add_branch = function (parent, new_branch) {
                               if (parent != null) {
                                   parent.children.push(new_branch);
                                   parent.expanded = true;
                               } else {
                                   scope.treeData.push(new_branch);
                               }
                               return new_branch;
                           };
                           tree.add_root_branch = function (new_branch) {
                               tree.add_branch(null, new_branch);
                               return new_branch;
                           };
                           tree.expand_branch = function (b) {
                               if (b == null) {
                                   b = tree.get_selected_branch();
                               }
                               if (b != null) {
                                   b.expanded = true;
                                   return b;
                               }
                           };
                           tree.collapse_branch = function (b) {
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   b.expanded = false;
                                   return b;
                               }
                           };
                           tree.get_siblings = function (b) {
                               var p, siblings;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   p = tree.get_parent_branch(b);
                                   if (p) {
                                       siblings = p.children;
                                   } else {
                                       siblings = scope.treeData;
                                   }
                                   return siblings;
                               }
                           };
                           tree.get_next_sibling = function (b) {
                               var i, siblings;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   siblings = tree.get_siblings(b);
                                   dataLength = siblings.length;
                                   i = siblings.indexOf(b);
                                   if (i < dataLength) {
                                       return siblings[i + 1];
                                   }
                               }
                           };
                           tree.get_prev_sibling = function (b) {
                               var i, siblings;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               siblings = tree.get_siblings(b);
                               dataLength = siblings.length;
                               i = siblings.indexOf(b);
                               if (i > 0) {
                                   return siblings[i - 1];
                               }
                           };
                           tree.select_next_sibling = function (b) {
                               var next;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   next = tree.get_next_sibling(b);
                                   if (next != null) {
                                       return tree.select_branch(next);
                                   }
                               }
                           };
                           tree.select_prev_sibling = function (b) {
                               var prev;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   prev = tree.get_prev_sibling(b);
                                   if (prev != null) {
                                       return tree.select_branch(prev);
                                   }
                               }
                           };
                           tree.get_first_child = function (b) {
                               var _ref;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   if (((_ref = b.children) != null ? _ref.length : void 0) > 0) {
                                       return b.children[0];
                                   }
                               }
                           };
                           tree.get_closest_ancestor_next_sibling = function (b) {
                               var next, parent;
                               next = tree.get_next_sibling(b);
                               if (next != null) {
                                   return next;
                               } else {
                                   parent = tree.get_parent_branch(b);
                                   return tree.get_closest_ancestor_next_sibling(parent);
                               }
                           };
                           tree.get_next_branch = function (b) {
                               var next;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   next = tree.get_first_child(b);
                                   if (next != null) {
                                       return next;
                                   } else {
                                       next = tree.get_closest_ancestor_next_sibling(b);
                                       return next;
                                   }
                               }
                           };
                           tree.select_next_branch = function (b) {
                               var next;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   next = tree.get_next_branch(b);
                                   if (next != null) {
                                       tree.select_branch(next);
                                       return next;
                                   }
                               }
                           };
                           tree.last_descendant = function (b) {
                               var last_child;
                               if (b == null) {
                                   
                               }
                               dataLength = b.children.length;
                               if (dataLength === 0) {
                                   return b;
                               } else {
                                   last_child = b.children[dataLength - 1];
                                   return tree.last_descendant(last_child);
                               }
                           };
                           tree.get_prev_branch = function (b) {
                               var parent, prev_sibling;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   prev_sibling = tree.get_prev_sibling(b);
                                   if (prev_sibling != null) {
                                       return tree.last_descendant(prev_sibling);
                                   } else {
                                       parent = tree.get_parent_branch(b);
                                       return parent;
                                   }
                               }
                           };
                           tree.select_prev_branch = function (b) {
                               var prev;
                               if (b == null) {
                                   b = selected_branch;
                               }
                               if (b != null) {
                                   prev = tree.get_prev_branch(b);
                                   if (prev != null) {
                                       tree.select_branch(prev);
                                       return prev;
                                   }
                               }
                           };
                           tree.initialized = true;
                           return tree;
                       }
                       /* end tree control api */
                   }
               }
           };
       }
    ]);
});